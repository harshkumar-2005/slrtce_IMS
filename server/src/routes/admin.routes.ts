import express from "express";
import {
  allUsers,
  createUser,
  deleteUser,
  UserById,
} from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleBased.middleware.js";
import { canCreateUser } from "../middlewares/create.middleware.js";
import { canDeleteUser } from "../middlewares/delete.middleware.js";

const router = express.Router();

router.get("/users", authMiddleware, authorizeRoles("ADMIN"), allUsers);

router.post(
  "/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canCreateUser(),
  createUser,
);

router.delete(
  "/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canDeleteUser(),
  deleteUser,
);

router.get("/users/:id", authMiddleware, authorizeRoles("ADMIN"), canCreateUser(), UserById);

export default router;
