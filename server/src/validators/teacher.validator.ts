import zod from "zod";

const teacherDataSchema = zod.object({
  // Department and designation as string names/codes
  department: zod.string().min(1, "Department is required"),
  designation: zod.string().min(1, "Designation is required"),
});

export default teacherDataSchema;

export type TeacherData = zod.infer<typeof teacherDataSchema>;
