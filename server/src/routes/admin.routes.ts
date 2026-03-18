import express from "express";
import { createUser } from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import {authorizeRoles}  from "../middlewares/roleBased.middleware.js";

const router = express.Router();

router.post("/create-user", authMiddleware, authorizeRoles("ADMIN"), createUser);

export default router;