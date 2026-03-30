import express from "express";
import authRoutes from "./auth.routes.js";
import adminRoutes from "./admin.routes.js";
import teacherRoutes from "./teacher.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);

router.use("/admin", adminRoutes);

router.use("/teacher", teacherRoutes);

export default router;
