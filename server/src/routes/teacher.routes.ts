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
  createMaterial,
  getMaterial,
  deleteMaterial,
  createAssignment,
  deleteAssignment,
  viewSubmission,
  gradeSubmission,
  uploadMarks,
  updateMarks,
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

router.post(
  "/materials",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  createMaterial,
);

router.get(
  "/materials/:subjectId",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN", "STAFF", "STUDENT"),
  getMaterial,
);

router.delete(
  "/materials/:materialId",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  deleteMaterial,
)

router.post(
  "/assignments",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  createAssignment,
);

router.delete(
  "/assignments/:assignmentId",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  deleteAssignment,
);

router.get(
  "/assignments/:assignmentId/submissions",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  viewSubmission,
);

router.post(
  "/assignments/:assignmentId/submissions/:submissionId/grade",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  gradeSubmission,
);

router.post(
  "/upload-marks",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  uploadMarks,
);

router.put(
  "/assignments/:assignmentId/submissions/:submissionId/marks",
  authMiddleware,
  authorizeRoles("TEACHER", "ADMIN"),
  updateMarks,
);

export default router;
