import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { RoleValue } from "../constants/auth.constants.js";
import { hasAtLeastRole } from "../utils/role.hierarchy.js";

export const authorizeRoles = (...roles: RoleValue[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role as RoleValue | undefined;

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
