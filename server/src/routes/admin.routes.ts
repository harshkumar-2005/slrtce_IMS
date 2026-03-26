import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUser,
  getUserById,
  createBranch,
  deleteBranch,
  getAllBranches,
  getBranchById,
  createDepartment,
  getAllDepartments,
  deleteDepartment,
  getDepartmentById,
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  getAllStaff,
  getAllStudents,
  getAllTeachers,
  getAllAdmins,
  assignTeacherToSubject,
  deassignTeacherFromSubject,
  getSubjectByTeacherId,
} from "../controllers/admin.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/roleBased.middleware.js";
import { canCreateUser } from "../middlewares/create.middleware.js";
import { canDeleteUser } from "../middlewares/delete.middleware.js";
import { get } from "node:http";

const router = express.Router();

router.get("/users", authMiddleware, authorizeRoles("ADMIN"), getAllUsers);

router.post(
  "/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canCreateUser(),
  createUser,
);

router.get(
  "/admins",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllAdmins,
);

router.get("/staff", authMiddleware, authorizeRoles("ADMIN"), getAllStaff);

router.get(
  "/teachers",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllTeachers,
);

router.get(
  "/students",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllStudents,
);

router.post(
  "/branches",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createBranch,
);

router.get(
  "/branches",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllBranches,
);

router.post(
  "/departments",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createDepartment,
);

router.get(
  "/departments",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllDepartments,
);

router.post(
  "/subjects",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  createSubject,
);

router.get(
  "/subjects",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  getAllSubjects,
);

router.post(
  "/subjects",
  authMiddleware,
  authorizeRoles("ADMIN"),
  assignTeacherToSubject,
);

router.post(
  "/subjects",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deassignTeacherFromSubject,
);

router.delete(
  "/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canDeleteUser(),
  deleteUser,
);

router.get(
  "/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canCreateUser(),
  getUserById,
);

router.get(
  "/branches/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getBranchById,
);

router.delete(
  "/branches/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteBranch,
);

router.delete(
  "/departments/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteDepartment,
);

router.get(
  "/departments/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getDepartmentById,
);

router.get(
  "/subjects/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  getSubjectById,
);

router.patch(
  "/subjects/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  updateSubject,
);

router.delete(
  "/subjects/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteSubject,
);

router.get(
  "/subjects/teacher/:teacherId/:semesterId",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  getSubjectByTeacherId,
);

export default router;
