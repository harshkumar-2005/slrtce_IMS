import zod from "zod";

const validLogin = zod.object({
    email: zod.email(),
    password: zod.string().min(6, "Password too short")
});

export default validLogin;