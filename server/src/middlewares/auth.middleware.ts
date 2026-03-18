import jwt from "jsonwebtoken";
import envConfig from "../config/env.config.js";
import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";

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

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}
