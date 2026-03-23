import zod from "zod";
import { ADMIN_LEVEL_VALUES } from "../constants/auth.constants.js";

const adminDataSchema = zod.object({
  accessLevel: zod.enum(ADMIN_LEVEL_VALUES),
});

export default adminDataSchema;
