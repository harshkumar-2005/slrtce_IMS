import { AuthRequest } from "../types/auth.types.js";
import { Response } from "express";
import {
  attendanceQueryValidator,
  createSessionValidator,
  markAttendanceValidator,
} from "../validators/attendanceSession.validator.js";
import {
  AttendanceError,
  createSessionService,
  getAttendanceByStudentService,
  listTeacherSessionsService,
  lockExpiredSessionsService,
  lockSessionService,
  markAttendanceService,
  getAttendanceBySessionIdService,
} from "../services/teacher.attendance.service.js";

const handleControllerError = (res: Response, err: unknown) => {
  if (err instanceof AttendanceError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  return res.status(500).json({
    success: false,
    message,
  });
};

const getSingleParam = (value: string | string[] | undefined, key: string) => {
  if (!value) {
    throw new AttendanceError(`${key} is required`);
  }

  if (Array.isArray(value)) {
    if (value.length !== 1) {
      throw new AttendanceError(`Invalid ${key}`);
    }
    return value[0];
  }

  return value;
};

export const createSession = async (req: AuthRequest, res: Response) => {
  try {
    const payload = createSessionValidator.parse(req.body);
    const userId = req.user.id;

    const session = await createSessionService(userId, payload);

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = getSingleParam(req.params.sessionId, "sessionId");
    const { records } = markAttendanceValidator.parse(req.body);

    const result = await markAttendanceService(req.user.id, sessionId, records);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};

export const getAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const data = attendanceQueryValidator.parse(req.query);
    const sessions = await listTeacherSessionsService(req.user.id, data);

    return res.status(200).json({
      success: true,
      ...sessions,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};

export const getAttendanceBySessionId = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const sessionId = getSingleParam(req.params.sessionId, "sessionId");
    const session = await getAttendanceBySessionIdService(sessionId);

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};

export const getAttendanceByStudent = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { studentId } = req.params;
    const data = attendanceQueryValidator.parse(req.query);

    const result = await getAttendanceByStudentService(Number(studentId), data);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};

export const lockSession = async (req: AuthRequest, res: Response) => {
  try {
    const sessionId = getSingleParam(req.params.sessionId, "sessionId");
    const result = await lockSessionService(req.user.id, sessionId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};

export const lockExpiredSessions = async (req: AuthRequest, res: Response) => {
  try {
    const result = await lockExpiredSessionsService();

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    return handleControllerError(res, err);
  }
};
