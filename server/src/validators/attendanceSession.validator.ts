import zod from "zod";

export const createSessionValidator = zod
  .object({
    topic: zod.string().min(2).max(200).optional(),
    subjectId: zod.number().int().positive(),
    subjectType: zod.enum(["THEORY", "PRACTICAL", "LAB"]),
    section: zod.string().min(1).max(20).optional(),
    mode: zod.enum(["START", "END"]).optional(),
    startTime: zod.string().datetime().optional(),
    endTime: zod.string().datetime().optional(),
    anchorTime: zod.string().datetime().optional(),
    durationMinutes: zod.number().int().min(1).max(480).optional(),
    graceMinutes: zod.number().int().min(0).max(120).optional(),
    lockAfterMinutes: zod.number().int().min(0).max(360).optional(),
    allowBackfill: zod.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    const hasStart = Boolean(value.startTime);
    const hasEnd = Boolean(value.endTime);

    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: zod.ZodIssueCode.custom,
        path: ["startTime"],
        message: "startTime and endTime must be provided together",
      });
    }
  });

export const markAttendanceValidator = zod.object({
  records: zod
    .array(
      zod.object({
        studentId: zod.number().int().positive(),
        status: zod.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
      }),
    )
    .min(1),
});

export const attendanceQueryValidator = zod.object({
  page: zod.coerce.number().int().min(1).optional(),
  limit: zod.coerce.number().int().min(1).max(100).optional(),
  subjectId: zod.coerce.number().int().positive().optional(),
  semesterId: zod.string().min(1).optional(),
  fromDate: zod.string().datetime().optional(),
  toDate: zod.string().datetime().optional(),
});
