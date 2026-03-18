import zod from "zod";
import { Branch, Department } from "@prisma/client";

const department = zod.enum(["UG", "PG"]);
const branch = zod.enum(["CSE", "ECE", "ME", "CE", "EE"]);

const studentDataSchema = zod.object({
  rollNo: zod.string().min(1, "Roll number is required").regex(/^\d+$/, {
    message: "rollNo must be a string containing only numbers",
  }),
  uid: zod.string().min(5).max(50).trim(),
  department: department,
  semester: zod.number().min(1).max(8, "Semester must be between 1 and 8"),
  branch: branch,
  section: zod.string().min(1, "Section is required").regex(/^[A-Z]$/, {
    message: "Section must be a single uppercase letter",
  }),
  year: zod.number().min(1).max(4, "Year must be between 1 and 4"),
});

export default studentDataSchema;

export type StudentData = {
  rollNo: string;
  uid: string;
  department: Department;
  semester: number;
  branch: Branch;
  section: string;
  year: number;
};