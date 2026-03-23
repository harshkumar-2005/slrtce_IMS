import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types.js";
import { ROLE_VALUES, RoleValue } from "../constants/auth.constants.js";
import { canManageRole } from "../utils/role.hierarchy.js";

const VALID_ROLES = new Set<RoleValue>(ROLE_VALUES);

export const canCreateUser = () => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const actorRole = req.user?.role as RoleValue | undefined;
    const targetRole = req.body?.role as RoleValue | undefined;

    if (!actorRole) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!targetRole || !VALID_ROLES.has(targetRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target role",
      });
    }

    if (!canManageRole(actorRole, targetRole)) {
      return res.status(403).json({
        success: false,
        message: "You cannot create a user with this role",
      });
    }

    next();
  };
};
