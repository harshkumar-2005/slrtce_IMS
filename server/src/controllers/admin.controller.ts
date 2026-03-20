import { AuthRequest } from "../types/auth.types.js";
import { Response } from "express";
import { createUserService } from "../services/admin.create.user.service.js";
import { deleteUserService } from "../services/admin.delete.user.service.js";
import {
  getAllUsersService,
  userByIdSerice,
} from "../services/admin.get.user.service.js";

export const allUsers = async (req: AuthRequest, res: Response) => {
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

export const UserById = async (req: AuthRequest, res: Response) => {
  const userId = String(req.params.id);

  try {
    const user = await userByIdSerice(userId);

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
