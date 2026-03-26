import express from "express";
import {
  getAllUsers,
  createUser,
  deleteUser,
  UserById,
  createBranch,
  deleteBranch,
  getAllBranchs,
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
  getAlladmins,
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

router.get("get/users", authMiddleware, authorizeRoles("ADMIN"), getAllUsers);

router.post(
  "create/users",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canCreateUser(),
  createUser,
);

router.get(
  "/get/admins",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAlladmins,
);

router.get("/get/staff", authMiddleware, authorizeRoles("ADMIN"), getAllStaff);

router.get(
  "/get/teachers",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllTeachers,
);

router.get(
  "/get/students",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllStudents,
);

router.post(
  "create/branches",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createBranch,
);

router.get(
  "get/branches",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllBranchs,
);

router.post(
  "create/departments",
  authMiddleware,
  authorizeRoles("ADMIN"),
  createDepartment,
);

router.get(
  "get/departments",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getAllDepartments,
);

router.post(
  "create/subjects",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  createSubject,
);

router.get(
  "get/subjects",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  getAllSubjects,
);

router.post(
  "assign/subjects",
  authMiddleware,
  authorizeRoles("ADMIN"),
  assignTeacherToSubject,
);

router.post(
  "deassign/subjects",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deassignTeacherFromSubject,
);

router.delete(
  "delete/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canDeleteUser(),
  deleteUser,
);

router.get(
  "get/users/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  canCreateUser(),
  UserById,
);

router.get(
  "get/branches/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getBranchById,
);

router.delete(
  "delete/branches/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteBranch,
);

router.delete(
  "delete/departments/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteDepartment,
);

router.get(
  "get/departments/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  getDepartmentById,
);

router.get(
  "get/subjects/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  getSubjectById,
);

router.patch(
  "/update/subjects/:id",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  updateSubject,
);

router.delete(
  "delete/subjects/:id",
  authMiddleware,
  authorizeRoles("ADMIN"),
  deleteSubject,
);

router.get(
  "get/subjects/teacher/:teacherId",
  authMiddleware,
  authorizeRoles("ADMIN", "TEACHER"),
  getSubjectByTeacherId,
);

export default router;
