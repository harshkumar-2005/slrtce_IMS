import zod from "zod";
import { Department } from "@prisma/client";
import { StaffPosition } from "@prisma/client";

const staffDataSchema = zod.object({
  department: zod.enum(Department),
  position: zod.enum(StaffPosition),
});

export default staffDataSchema;
