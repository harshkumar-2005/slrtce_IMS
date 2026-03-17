import zod, { email } from "zod";

const validLogin = zod.object({
    uid: zod.string().min(12).max(12),
    email: zod.email(),
    password: zod.string()
});

export default validLogin;