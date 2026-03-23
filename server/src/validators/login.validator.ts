import zod from "zod";
import { ROLE_VALUES } from "../constants/auth.constants.js";

const validLogin = zod.object({
  email: zod.email(),
  password: zod.string().min(6, "Password too short"),
  role: zod.enum(ROLE_VALUES),
});

export default validLogin;
