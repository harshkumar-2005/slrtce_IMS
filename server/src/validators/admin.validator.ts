import zod from "zod";
import { AdminLevel } from "../generated/prisma/client.js";

const adminDataSchema = zod.object({
    accessLevel: zod.enum(AdminLevel),
});

export default adminDataSchema;