import zod from "zod";
import { AdminLevel } from "@prisma/client";

const adminDataSchema = zod.object({
    accessLevel: zod.enum(AdminLevel),
});

export default adminDataSchema;