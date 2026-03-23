import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { ROLE_VALUES, RoleValue } from "../constants/auth.constants.js";

type JwtPayload = {
  id: string;
  role: RoleValue;
};

const VALID_ROLES = new Set<RoleValue>(ROLE_VALUES);

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

    const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN) as JwtPayload;

    if (!decoded?.id || !VALID_ROLES.has(decoded.role)) {
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
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
