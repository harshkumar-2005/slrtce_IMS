import express from "express";
import {
  loginRoute,
  profile,
  resetPassword,
  logout,
  refreshToken
} from "../controllers/auth.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", loginRoute);

router.get("/profile", authMiddleware, profile);

router.patch("/reset-password", authMiddleware, resetPassword);

router.post("/logout", authMiddleware, logout);

router.post("/refresh-token", refreshToken);

export default router;
