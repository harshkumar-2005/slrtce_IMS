import { AttendanceStatus, Prisma, SubjectType } from "@prisma/client";
import prisma from "../lib/prisma.js";

type SessionMode = "START" | "END";

type CreateSessionInput = {
  topic?: string;
  subjectId: number;
  subjectType: SubjectType;
  section?: string;
  mode?: SessionMode;
  startTime?: string;
  endTime?: string;
  anchorTime?: string;
  durationMinutes?: number;
  graceMinutes?: number;
  lockAfterMinutes?: number;
  allowBackfill?: boolean;
};

type MarkRecordInput = {
  studentId: number;
  status?: AttendanceStatus;
};

class AttendanceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = "AttendanceError";
    this.statusCode = statusCode;
  }
}

const defaultDurationByType: Record<SubjectType, number> = {
  THEORY: 60,
  PRACTICAL: 120,
  LAB: 120,
};

const parseDate = (value: string, fieldName: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new AttendanceError(`Invalid ${fieldName}`);
  }
  return date;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const resolveWindow = (input: CreateSessionInput) => {
  const mode: SessionMode = input.mode ?? "START";
  const durationMinutes =
    input.durationMinutes ?? defaultDurationByType[input.subjectType] ?? 60;

  let startTime: Date;
  let endTime: Date;

  if (input.startTime && input.endTime) {
    startTime = parseDate(input.startTime, "startTime");
    endTime = parseDate(input.endTime, "endTime");
  } else {
    const anchor = input.anchorTime
      ? parseDate(input.anchorTime, "anchorTime")
      : new Date();

    if (mode === "START") {
      startTime = anchor;
      endTime = new Date(anchor.getTime() + durationMinutes * 60 * 1000);
    } else {
      endTime = anchor;
      startTime = new Date(anchor.getTime() - durationMinutes * 60 * 1000);
    }
  }

  if (startTime >= endTime) {
    throw new AttendanceError("Session startTime must be before endTime");
  }

  return { startTime, endTime };
};

const getTeacherProfileOrThrow = async (userId: string) => {
  const teacher = await prisma.teacherProfile.findUnique({
    where: { userId },
  });

  if (!teacher) {
    throw new AttendanceError("Teacher profile not found", 404);
  }

  return teacher;
};

export const createSessionService = async (
  userId: string,
  input: CreateSessionInput,
) => {
  const teacher = await getTeacherProfileOrThrow(userId);

  const subject = await prisma.subject.findUnique({
    where: { id: input.subjectId },
    select: {
      id: true,
      semesterId: true,
      branchDepartmentId: true,
      type: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!subject || !subject.isActive || subject.deletedAt) {
    throw new AttendanceError("Subject not found or inactive", 404);
  }

  const teacherSubject = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacher.id,
      subjectId: subject.id,
      semesterId: subject.semesterId,
      deletedAt: null,
      ...(input.section ? { section: input.section } : {}),
    },
    select: { id: true },
  });

  if (!teacherSubject) {
    throw new AttendanceError(
      "Teacher is not assigned to this subject/semester/section",
      403,
    );
  }

  const { startTime, endTime } = resolveWindow(input);
  const date = startOfDay(startTime);
  const now = new Date();

  const isBackfill = endTime.getTime() < now.getTime();
  if (isBackfill && input.allowBackfill === false) {
    throw new AttendanceError("Backfill session creation is disabled");
  }

  const overlap = await prisma.attendanceSession.findFirst({
    where: {
      teacherId: teacher.id,
      date,
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
    select: { id: true },
  });

  if (overlap) {
    throw new AttendanceError("Overlapping session exists for this teacher");
  }

  const graceMinutes = input.graceMinutes ?? 10;
  const lockAfterMinutes = input.lockAfterMinutes ?? 15;

  try {
    return await prisma.attendanceSession.create({
      data: {
        subjectId: subject.id,
        subjectType: input.subjectType,
        semesterId: subject.semesterId,
        teacherId: teacher.id,
        branchDepartmentId: subject.branchDepartmentId,
        section: input.section,
        topic: input.topic,
        date,
        startTime,
        endTime,
        graceMinutes,
        autoLockAt: new Date(endTime.getTime() + lockAfterMinutes * 60 * 1000),
        isLocked: isBackfill,
        lockedAt: isBackfill ? now : null,
        lockReason: isBackfill ? "BACKFILL" : null,
        isBackfill,
      },
      include: {
        subject: { select: { id: true, name: true, code: true } },
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AttendanceError(
        "Duplicate session slot already exists for teacher/subject/date/startTime",
      );
    }
    throw error;
  }
};

const assertSessionWritable = async (sessionId: string, teacherId: number) => {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      teacherId: true,
      semesterId: true,
      section: true,
      branchDepartmentId: true,
      startTime: true,
      endTime: true,
      graceMinutes: true,
      autoLockAt: true,
      isLocked: true,
    },
  });

  if (!session) {
    throw new AttendanceError("Session not found", 404);
  }

  if (session.teacherId !== teacherId) {
    throw new AttendanceError("You cannot modify another teacher session", 403);
  }

  if (session.isLocked) {
    throw new AttendanceError("Session is locked", 409);
  }

  const now = new Date();
  if (now.getTime() > session.autoLockAt.getTime()) {
    await prisma.attendanceSession.update({
      where: { id: session.id },
      data: {
        isLocked: true,
        lockedAt: now,
        lockReason: "CRON",
      },
    });

    throw new AttendanceError("Session is auto-locked", 409);
  }

  return session;
};

const detectStatus = (
  requestedStatus: AttendanceStatus | undefined,
  now: Date,
  startTime: Date,
  graceMinutes: number,
) => {
  if (!requestedStatus || requestedStatus === AttendanceStatus.PRESENT) {
    const lateCutoff = new Date(startTime.getTime() + graceMinutes * 60 * 1000);
    return now.getTime() > lateCutoff.getTime()
      ? AttendanceStatus.LATE
      : AttendanceStatus.PRESENT;
  }

  return requestedStatus;
};

export const markAttendanceService = async (
  userId: string,
  sessionId: string,
  records: MarkRecordInput[],
) => {
  if (!records.length) {
    throw new AttendanceError("Attendance records are required");
  }

  const uniqueStudentIds = new Set<number>();
  for (const record of records) {
    if (uniqueStudentIds.has(record.studentId)) {
      throw new AttendanceError(
        `Duplicate studentId ${record.studentId} in payload`,
      );
    }
    uniqueStudentIds.add(record.studentId);
  }

  const teacher = await getTeacherProfileOrThrow(userId);
  const session = await assertSessionWritable(sessionId, teacher.id);

  const studentIds = [...uniqueStudentIds];

  const eligibleStudents = await prisma.studentProfile.findMany({
    where: {
      id: { in: studentIds },
      branchDepartmentId: session.branchDepartmentId,
      semesterId: session.semesterId,
      ...(session.section ? { section: session.section } : {}),
      deletedAt: null,
    },
    select: { id: true },
  });

  const eligibleSet = new Set(eligibleStudents.map((s) => s.id));
  const invalidStudentIds = studentIds.filter((id) => !eligibleSet.has(id));

  if (invalidStudentIds.length > 0) {
    throw new AttendanceError(
      `Invalid student(s) for this session: ${invalidStudentIds.join(", ")}`,
    );
  }

  const existingRecords = await prisma.attendanceRecord.findMany({
    where: {
      sessionId,
      studentId: { in: studentIds },
    },
    select: {
      studentId: true,
    },
  });

  const existingSet = new Set(existingRecords.map((r) => r.studentId));
  const now = new Date();

  const upserts = records.map((record) =>
    prisma.attendanceRecord.upsert({
      where: {
        sessionId_studentId: {
          sessionId,
          studentId: record.studentId,
        },
      },
      update: {
        status: detectStatus(
          record.status,
          now,
          session.startTime,
          session.graceMinutes,
        ),
        markedAt: now,
        markedBy: teacher.id,
      },
      create: {
        sessionId,
        studentId: record.studentId,
        status: detectStatus(
          record.status,
          now,
          session.startTime,
          session.graceMinutes,
        ),
        markedAt: now,
        markedBy: teacher.id,
      },
    }),
  );

  await prisma.$transaction(upserts);

  const updatedCount = studentIds.filter((id) => existingSet.has(id)).length;
  const createdCount = studentIds.length - updatedCount;

  return {
    sessionId,
    totalProcessed: studentIds.length,
    createdCount,
    updatedCount,
  };
};

export const lockSessionService = async (userId: string, sessionId: string) => {
  const teacher = await getTeacherProfileOrThrow(userId);

  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      teacherId: true,
      isLocked: true,
    },
  });

  if (!session) {
    throw new AttendanceError("Session not found", 404);
  }

  if (session.teacherId !== teacher.id) {
    throw new AttendanceError("You cannot lock another teacher session", 403);
  }

  if (session.isLocked) {
    return {
      sessionId,
      alreadyLocked: true,
    };
  }

  await prisma.attendanceSession.update({
    where: { id: sessionId },
    data: {
      isLocked: true,
      lockedAt: new Date(),
      lockReason: "MANUAL",
    },
  });

  return {
    sessionId,
    alreadyLocked: false,
  };
};

export const lockExpiredSessionsService = async () => {
  const now = new Date();

  const result = await prisma.attendanceSession.updateMany({
    where: {
      isLocked: false,
      autoLockAt: { lte: now },
    },
    data: {
      isLocked: true,
      lockedAt: now,
      lockReason: "CRON",
    },
  });

  return {
    lockedCount: result.count,
    lockedAt: now,
  };
};

export const getAttendanceBySessionIdService = async (sessionId: string) => {
  const session = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      subject: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      teacher: {
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true } },
        },
      },
      records: {
        include: {
          student: {
            select: {
              id: true,
              rollNo: true,
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: {
          markedAt: "asc",
        },
      },
    },
  });

  if (!session) {
    throw new AttendanceError("Session not found", 404);
  }

  return session;
};

export const listTeacherSessionsService = async (
  userId: string,
  query: {
    subjectId?: number;
    semesterId?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  },
) => {
  const teacher = await getTeacherProfileOrThrow(userId);

  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.AttendanceSessionWhereInput = {
    teacherId: teacher.id,
    ...(query.subjectId ? { subjectId: query.subjectId } : {}),
    ...(query.semesterId ? { semesterId: query.semesterId } : {}),
  };

  if (query.fromDate || query.toDate) {
    where.date = {
      ...(query.fromDate
        ? { gte: startOfDay(parseDate(query.fromDate, "fromDate")) }
        : {}),
      ...(query.toDate
        ? { lte: startOfDay(parseDate(query.toDate, "toDate")) }
        : {}),
    };
  }

  const [items, total] = await prisma.$transaction([
    prisma.attendanceSession.findMany({
      where,
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            records: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      skip,
      take: limit,
    }),
    prisma.attendanceSession.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAttendanceByStudentService = async (
  studentId: number,
  query: {
    subjectId?: number;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  },
) => {
  const page = Math.max(query.page ?? 1, 1);
  const limit = Math.min(Math.max(query.limit ?? 20, 1), 100);
  const skip = (page - 1) * limit;

  const where: Prisma.AttendanceRecordWhereInput = {
    studentId,
    ...(query.subjectId ? { session: { subjectId: query.subjectId } } : {}),
  };

  if (query.fromDate || query.toDate) {
    where.session = {
      is: {
        ...(query.subjectId ? { subjectId: query.subjectId } : {}),
        date: {
          ...(query.fromDate
            ? { gte: startOfDay(parseDate(query.fromDate, "fromDate")) }
            : {}),
          ...(query.toDate
            ? { lte: startOfDay(parseDate(query.toDate, "toDate")) }
            : {}),
        },
      },
    };
  }

  const [items, total] = await prisma.$transaction([
    prisma.attendanceRecord.findMany({
      where,
      include: {
        session: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        markedAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.attendanceRecord.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export { AttendanceError };
