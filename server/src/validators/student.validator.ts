import zod from "zod";

const studentDataSchema = zod.object({
  rollNo: zod.string().min(1, "Roll number is required").regex(/^\d+$/, {
    message: "rollNo must be a string containing only numbers",
  }),
  uid: zod.string().min(12).max(12).trim(),
  // Department and branch as string names/codes
  department: zod.string().min(1, "Department is required"),
  branch: zod.string().min(1, "Branch is required"),
  semester: zod.number().min(1).max(8, "Semester must be between 1 and 8"),
  section: zod
    .string()
    .min(1, "Section is required")
    .regex(/^[A-Z]$/, {
      message: "Section must be a single uppercase letter",
    }),
});

export default studentDataSchema;

export type StudentData = zod.infer<typeof studentDataSchema>;
