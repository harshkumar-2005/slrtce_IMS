import { AuthRequest } from "../types/auth.types.js";

import { Response } from "express";

import { createUserService } from "../services/admin.create.user.service.js";

import {
  getAllUsersService,
  getUserByIdService,
  deleteUserService,
  getAllAdminService,
  getAllStaffService,
  getAllTeachersService,
  getAllStudentsService,
} from "../services/admin.user.service.js";

import {
  createBranchService,
  getAllBranchesService,
  deleteBranchService,
  getBranchByIdService,
} from "../services/branch.service.js";

import {
  createDepartmentService,
  getAllDepartmentsService,
  deleteDepartmentService,
  getDepartmentByIdService,
} from "../services/department.service.js";

import {
  createSubjectService,
  getAllSubjectsService,
  getSubjectByIdService,
  updateSubjectService,
  deleteSubjectService,
  assignTeacherToSubjectService,
  deassignTeacherFromSubjectService,
  getSubjectsByTeacherIdService,
} from "../services/subject.service.js";

import {
  createBranchDepartmentMapping,
  getAllBranchDepartmentMappings,
  getBranchDepartmentByIdMapping,
  deleteBranchDepartmentMapping,
  updateBranchDepartmentMapping,
} from "../services/map.branch.department.service.js";

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };

    const users = await getAllUsersService(Number(page), Number(limit), search);

    res.status(200).json({ success: true, users });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  const {
    email,
    password,
    name,
    phone,
    role,
    studentData,
    teacherData,
    staffData,
    adminData,
  } = req.body;
  // studentData, teacherData, staffData are optional and depend on the role being created
  // And studentData, teacherData, staffData is a object which are as per prisma.schema file and are required for creating respective profiles.

  if (!email || !password || !name || !phone || !role) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const user = await createUserService({
      email,
      password,
      name,
      phone,
      role,
      studentData,
      teacherData,
      staffData,
      adminData,
    });

    res
      .status(201)
      .json({ success: true, message: "User created successfully", user });
  } catch (err: any) {
    return res
      .status(500)
      .json({ success: false, message: err.message || "Error creating user" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  const userId = String(req.params.id);

  try {
    const user = await getUserByIdService(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Failed to fetch user" });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const userId = String(req.params.id);

    await deleteUserService(userId);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to delete user",
    });
  }
};

export const getAllAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const admins = await getAllAdminService(
      Number(page),
      Number(limit),
      search,
    );

    res.status(200).json({ success: true, admins });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllStaff = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query as { page?: string; limit?: string; search?: string };
    const staff = await getAllStaffService(Number(page), Number(limit), search);

    res.status(200).json({ success: true, staff });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllTeachers = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const teachers = await getAllTeachersService(
      Number(page),
      Number(limit),
      search,
    );

    res.status(200).json({ success: true, teachers });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllStudents = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const students = await getAllStudentsService(
      Number(page),
      Number(limit),
      search,
    );

    res.status(200).json({ success: true, students });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const createBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: "Name and code is required.",
      });
    }

    await createBranchService(name, code, true);

    res.status(201).json({
      success: true,
      message: "Branch created successfully.",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getAllBranches = async (req: AuthRequest, res: Response) => {
  try {
    const branches = await getAllBranchesService();

    res.status(200).json({
      success: true,
      branches,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getBranchById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const branch = await getBranchByIdService(Number(id));

    res.status(200).json({
      success: true,
      branch,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteBranchService(Number(id));

    res.status(200).json({
      success: true,
      message: "Branch deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const createDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res
        .status(400)
        .json({ success: false, message: "Name and code are required" });
    }
    const department = await createDepartmentService(name, code);
    res.status(201).json({
      success: true,
      message: "Department created successfully",
      department,
    });
  } catch (err: any) {
    res
      .status(500)
      .json({ success: false, message: err.message || "Server error" });
  }
};

export const getAllDepartments = async (req: AuthRequest, res: Response) => {
  try {
    const departments = await getAllDepartmentsService();

    res.status(200).json({
      success: true,
      departments,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getDepartmentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const department = await getDepartmentByIdService(Number(id));

    res.status(200).json({
      success: true,
      department,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const deleteDepartment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await deleteDepartmentService(Number(id));

    res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const createBranchDepartment = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { branchId, departmentId } = req.body;

    const mapping = await createBranchDepartmentMapping(branchId, departmentId);
    res.status(201).json({
      success: true,
      mapping,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const getAllBranchDepartments = async (
  req: AuthRequest,
  res: Response,
) => {
  const {
    page = 1,
    limit = 10,
    search = "",
  } = req.query as { page?: string; limit?: string; search?: string };
  try {
    const result = await getAllBranchDepartmentMappings(
      Number(page),
      Number(limit),
      search,
    );

    res.status(200).json({
      success: true,
      data: result.data,
      meta: {
        page,
        limit,
        totalPages: result.totalPages,
      },
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const getBranchDepartmentById = async (
  req: AuthRequest,
  res: Response,
) => {
  const { id } = req.params;
  try {
    const data = await getBranchDepartmentByIdMapping(Number(id));
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Branch-Department mapping not found",
      });
    }
    res.status(200).json({
      success: true,
      mappings: data,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const updateBranchDepartment = async (
  req: AuthRequest,
  res: Response,
) => {
  const { id } = req.params;
  const { branchId, departmentId } = req.body;

  try {
    const mapping = await updateBranchDepartmentMapping(
      Number(id),
      branchId,
      departmentId,
    );
    res.status(200).json({
      success: true,
      mapping,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const deleteBranchDepartment = async (
  req: AuthRequest,
  res: Response,
) => {
  const { id } = req.params;
  try {
    await deleteBranchDepartmentMapping(Number(id));
    res.status(200).json({
      success: true,
      message: "Branch-Department mapping deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

export const createSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, branchDepartmentId, credits, type, semesterId } =
      req.body;

    const subject = await createSubjectService(
      name,
      code,
      branchDepartmentId,
      credits,
      type,
      semesterId,
    );

    res.status(201).json({
      success: true,
      message: "Subject created successfully",
      subject,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getAllSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
    } = req.query as {
      page?: string;
      limit?: string;
      search?: string;
    };
    const subjects = await getAllSubjectsService(
      Number(page),
      Number(limit),
      search,
    );
    res.status(200).json({
      success: true,
      subjects,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getSubjectById = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const subject = await getSubjectByIdService(Number(id));
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: "Subject not found",
      });
    }
    res.status(200).json({
      success: true,
      subject,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const updateSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, code, branchDepartmentId, credits, type, semesterId } =
      req.body;

    if (
      !id ||
      !name ||
      !code ||
      !branchDepartmentId ||
      !credits ||
      !type ||
      !semesterId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required for update.",
      });
    }

    const subject = await updateSubjectService(
      Number(id),
      name,
      code,
      branchDepartmentId,
      credits,
      type,
      semesterId,
    );

    res.status(200).json({
      success: true,
      message: "Subject updated successfully",
      subject,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const deleteSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subject ID is required.",
      });
    }

    await deleteSubjectService(Number(id));
    res.status(200).json({
      success: true,
      message: "Subject deleted successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const assignTeacherToSubject = async (
  req: AuthRequest,
  res: Response,
) => {
  const { semesterId, subjectId, teacherId, section = "" } = req.body;
  if (!semesterId || !subjectId || !teacherId) {
    return res.status(400).json({
      success: false,
      message: "semesterId, subjectId and teacherId are required.",
    });
  }
  try {
    await assignTeacherToSubjectService(
      semesterId,
      subjectId,
      teacherId,
      section,
    );
    res.status(200).json({
      success: true,
      message: "Teacher assigned to subject successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const deassignTeacherFromSubject = async (
  req: AuthRequest,
  res: Response,
) => {
  const { semesterId, subjectId, teacherId, section = "" } = req.body;

  if (!semesterId || !subjectId || !teacherId) {
    return res.status(400).json({
      success: false,
      message: "semesterId, subjectId and teacherId are required.",
    });
  }

  try {
    await deassignTeacherFromSubjectService(
      semesterId,
      subjectId,
      teacherId,
      section,
    );
    res.status(200).json({
      success: true,
      message: "Teacher deassigned from subject successfully",
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

export const getSubjectByTeacherId = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { teacherId, semesterId } = req.params;
    const subjects = await getSubjectsByTeacherIdService(
      Number(teacherId),
      String(semesterId),
    );
    res.status(200).json({
      success: true,
      subjects,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Internal server error.",
    });
  }
};

