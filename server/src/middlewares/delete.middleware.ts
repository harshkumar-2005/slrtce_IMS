import { validate as isUUID } from "uuid";
import { AuthRequest } from "../types/auth.types.js";
import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { canManageRole } from "../utils/role.hierarchy.js";

export const canDeleteUser = () => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      const targetUserId = String(req.params.id);

      if (!isUUID(targetUserId)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          role: true,
        },
      });

      if (!currentUser || !targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const actorRole = currentUser.role as Role;
      const targetRole = targetUser.role;

      if (!canManageRole(actorRole, targetRole)) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete this user",
        });
      }

      if (currentUser.id === targetUser.id) {
        return res.status(403).json({
          success: false,
          message: "You cannot delete your own account",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  };
};