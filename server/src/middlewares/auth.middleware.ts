import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { Role } from "@prisma/client";

const VALID_ROLES = new Set<Role>(["ADMIN", "TEACHER", "STAFF", "STUDENT"]);

export default function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !("id" in decoded) ||
      !("role" in decoded) ||
      typeof decoded.id !== "string" ||
      typeof decoded.role !== "string" ||
      !VALID_ROLES.has(decoded.role as Role)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload",
      });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
