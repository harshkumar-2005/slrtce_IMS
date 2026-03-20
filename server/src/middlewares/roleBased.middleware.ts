import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { Role } from "@prisma/client";
import { hasAtLeastRole } from "../utils/role.hierarchy.js";

export const authorizeRoles = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as Role | undefined;

    if (!userRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const isAllowed = roles.some((requiredRole) =>
      hasAtLeastRole(userRole, requiredRole),
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access denied",
      });
    }
    next();
  };
};
