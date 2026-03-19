import zod from "zod";
import { Role } from "@prisma/client";

const validLogin = zod.object({
    email: zod.email(),
    password: zod.string().min(6, "Password too short"),
    role: zod.enum(Role),
});

export default validLogin;