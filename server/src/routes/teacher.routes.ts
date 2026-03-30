import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleBased.middleware.js";
import {
  createSession,
  getAttendanceByStudent,
  getAttendance,
  lockExpiredSessions,
  lockSession,
  markAttendance,
  getAttendanceBySessionId,
} from "../controllers/teacher.controller.js";

const router = express.Router();

router.post(
  "/attendance-sessions",
  authMiddleware,
  authorizeRoles("TEACHER"),
  createSession,
);

router.get(
  "/attendance-sessions",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN", "STAFF"),
  getAttendance,
);

router.get(
  "/attendance-sessions/:sessionId",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN", "STAFF", "STUDENT"),
  getAttendanceBySessionId,
);

router.post(
  "/attendance-sessions/:sessionId/attendance",
  authMiddleware,
  authorizeRoles("TEACHER"),
  markAttendance,
);

router.post(
  "/attendance-sessions/:sessionId/lock",
  authMiddleware,
  authorizeRoles("TEACHER"),
  lockSession,
);

router.post(
  "/attendance-sessions/lock-expired",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN", "STAFF"),
  lockExpiredSessions,
);

router.get(
  "/students/:studentId/attendance",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN", "STAFF", "STUDENT"),
  getAttendanceByStudent,
);

export default router;
