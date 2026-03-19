import zod from "zod";
// Import the actual Enums from Prisma to stay in sync
import { Branch, Department } from "@prisma/client";

const studentDataSchema = zod.object({
  rollNo: zod.string().min(1, "Roll number is required").regex(/^\d+$/, {
    message: "rollNo must be a string containing only numbers",
  }),
  uid: zod.string().min(5).max(50).trim(),
  // Use nativeEnum so Zod validates against the Prisma generated list
  department: zod.enum(Department),
  branch: zod.enum(Branch),
  semester: zod.number().min(1).max(8, "Semester must be between 1 and 8"),
  section: zod
    .string()
    .min(1, "Section is required")
    .regex(/^[A-Z]$/, {
      message: "Section must be a single uppercase letter",
    }),
  year: zod.number().min(1).max(4, "Year must be between 1 and 4"),
});

export default studentDataSchema;
