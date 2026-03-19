import argon2 from "argon2";
import studentDataSchema from "../validators/student.validator.js";
import teacherDataSchema from "../validators/teacher.validator.js";
import staffDataSchema from "../validators/staff.validator.js";
import adminDataSchema from "../validators/admin.validator.js";
import {
  AdminLevel,
  Branch,
  Department,
  Designation,
  Prisma,
  Role,
  StaffPosition,
} from "@prisma/client";
import prisma from '../lib/prisma.js';

type Tx = Prisma.TransactionClient;

// Service functions for creating user profiles based on role
const createStudentProfileService = async (
  tx: Tx,
  userId: string,
  studentData: {
    rollNo: string;
    uid: string;
    department: Department;
    semester: number;
    branch: Branch;
    section: string;
    year: number;
  },
) => {
  // Implementation for creating student profile
  const rollNoExists = await tx.studentProfile.findUnique({
    where: {
      rollNo: studentData!.rollNo,
    },
  });

  if (rollNoExists) {
    throw new Error("Student profile with this roll number already exists");
  }

  const parsed = studentDataSchema.parse(studentData);
  const validatedStudentData = {
    ...parsed,
    department: parsed.department as Department,
    branch: parsed.branch as Branch,
  };
  const student = await tx.studentProfile.create({
    data: {
      rollNo: validatedStudentData.rollNo,
      branch: validatedStudentData.branch,
      department: validatedStudentData.department,
      semester: validatedStudentData.semester,
      section: validatedStudentData.section,
      year: validatedStudentData.year,
      uid: validatedStudentData.uid,
      userId: userId,
    },
  });

  return student;
};

const createTeacherProfileService = async (
  tx: Tx,
  userId: string,
  teacherData?: {
    department: Department;
    designation: Designation;
  },
) => {
  // Implementation for creating teacher profile
  if (!teacherData) {
    throw new Error("Teacher data is required for creating teacher profile");
  }
  const validatedTeacherData = teacherDataSchema.parse(teacherData);

  const teacher = await tx.teacherProfile.create({
    data: {
      department: validatedTeacherData.department,
      designation: validatedTeacherData.designation,
      userId: userId,
    },
  });

  return teacher;
};

const createStaffProfileService = async (
  tx: Tx,
  userId: string,
  staffData?: {
    department: Department;
    position: StaffPosition;
  },
) => {
  // Implementation for creating staff profile
  if (!staffData) {
    throw new Error("Staff data is required for creating staff profile");
  }

  const validatedStaffData = staffDataSchema.parse(staffData);

  const staff = await tx.staffProfile.create({
    data: {
      department: validatedStaffData.department,
      position: validatedStaffData.position,
      userId: userId,
    },
  });

  return staff;
};

const createAdminProfileService = async (
  tx: Tx,
  userId: string,
  adminData?: {
    accessLevel: AdminLevel;
  },
) => {
  // Implementation for creating admin profile
  if (!adminData) {
    throw new Error("Admin data is required for creating admin profile");
  }
  const validatedAdminData = adminDataSchema.parse(adminData);

  const admin = await tx.adminProfile.create({
    data: {
      accessLevel: validatedAdminData.accessLevel,
      userId: userId,
    },
  });

  return admin;
};

export const createUserService = async (userData: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: Role;

  studentData?: {
    rollNo: string;
    uid: string;
    department: Department;
    semester: number;
    branch: Branch;
    section: string;
    year: number;
  };

  teacherData?: {
    department: Department;
    designation: Designation;
  };

  staffData?: {
    department: Department;
    position: StaffPosition;
  };

  adminData?: {
    accessLevel: AdminLevel;
  };
}) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ phone: userData.phone }, { email: userData.email }],
    },
  });

  if (existingUser) {
    throw new Error("User with this email or phone number already exists");
  }

    const phoneExist = await prisma.user.findUnique({
        where: {
            phone: userData.phone
        }
    });

  if (phoneExist) {
    throw new Error("Phone number already associated with another profile");
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Create user
    const newUser = await tx.user.create({
      data: {
        email: userData.email,
        password: await argon2.hash(userData.password),
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
      },
    });

    // 2. Create profile based on role
    switch (newUser.role) {
      case "STUDENT":
        if (!userData.studentData) {
          throw new Error("Student data required");
        }
        await createStudentProfileService(tx, newUser.id, userData.studentData);
        break;

      case "TEACHER":
        if (!userData.teacherData) {
          throw new Error("Teacher data required");
        }
        await createTeacherProfileService(tx, newUser.id, userData.teacherData);
        break;

      case "STAFF":
        if (!userData.staffData) {
          throw new Error("Staff data required");
        }
        await createStaffProfileService(tx, newUser.id, userData.staffData);
        break;

      case "ADMIN":
        if (!userData.adminData) {
          throw new Error("Admin data required");
        }
        await createAdminProfileService(tx, newUser.id, userData.adminData);
        break;
    }

    return newUser;
  });
};
