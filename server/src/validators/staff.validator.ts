import zod from "zod";
import { Department } from "../generated/prisma/client.js";
import { StaffPosition } from "../generated/prisma/client.js";

const staffDataSchema = zod.object({
  department: zod.enum(Department),
  position: zod.enum(StaffPosition),
});

export default staffDataSchema;
