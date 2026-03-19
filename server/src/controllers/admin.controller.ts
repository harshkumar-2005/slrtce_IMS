import { AuthRequest } from "../types/auth.types.js";
import { Response } from "express";
import { createUserService } from "../services/admin.service.js";

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
    return res.status(400).json({ message: "All fields are required" });
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
      adminData
    });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Error creating user" });
  }
};
