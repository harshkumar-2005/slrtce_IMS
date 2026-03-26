import argon2 from "argon2";
import studentDataSchema from "../validators/student.validator.js";
import teacherDataSchema from "../validators/teacher.validator.js";
import staffDataSchema from "../validators/staff.validator.js";
import adminDataSchema from "../validators/admin.validator.js";
import { Prisma } from "@prisma/client";
import prisma from "../lib/prisma.js";
import { AdminLevelValue, RoleValue } from "../constants/auth.constants.js";

type Tx = Prisma.TransactionClient;

// Service functions for creating user profiles based on role
const createStudentProfileService = async (
  tx: Tx,
  userId: string,
  studentData: {
    rollNo: string;
    uid: string;
    department: string;
    semester: number;
    branch: string;
    section: string;
  },
) => {
  // Implementation for creating student profile
  if (!studentData) {
    throw new Error("Student data is required for creating student profile");
  }
  const rollNoExists = await tx.studentProfile.findUnique({
    where: {
      rollNo: studentData.rollNo,
    },
  });

  if (rollNoExists) {
    throw new Error("Student profile with this roll number already exists");
  }

  const parsed = studentDataSchema.parse(studentData);

  // Find department by name/code
  const department = await tx.department.findFirst({
    where: {
      OR: [{ name: parsed.department }, { code: parsed.department }],
    },
  });

  if (!department) {
    throw new Error(`Department "${parsed.department}" not found`);
  }

  // Find branch by name/code
  const branch = await tx.branch.findFirst({
    where: {
      OR: [{ name: parsed.branch }, { code: parsed.branch }],
    },
  });

  if (!branch) {
    throw new Error(`Branch "${parsed.branch}" not found`);
  }

  // Find or create the BranchDepartment mapping
  const branchDepartment = await tx.branchDepartment.findFirst({
    where: {
      branchId: branch.id,
      departmentId: department.id,
    },
  });

  if (!branchDepartment) {
    throw new Error("Branch and Department combination does not exist");
  }

  // Find semester by number
  const semester = await tx.semester.findFirst({
    where: {
      number: parsed.semester,
    },
  });

  if (!semester) {
    throw new Error(`Semester "${parsed.semester}" not found`);
  }

  const student = await tx.studentProfile.create({
    data: {
      rollNo: parsed.rollNo,
      branchId: branch.id,
      departmentId: department.id,
      branchDepartmentId: branchDepartment.id,
      semesterId: semester.id,
      section: parsed.section,
      uid: parsed.uid,
      userId: userId,
    },
  });

  return student;
};

const createTeacherProfileService = async (
  tx: Tx,
  userId: string,
  teacherData?: {
    department: string;
    designation: string;
  },
) => {
  // Implementation for creating teacher profile
  if (!teacherData) {
    throw new Error("Teacher data is required for creating teacher profile");
  }
  const validatedTeacherData = teacherDataSchema.parse(teacherData);

  // Find department by name/code
  const department = await tx.department.findFirst({
    where: {
      OR: [
        { name: validatedTeacherData.department },
        { code: validatedTeacherData.department },
      ],
    },
  });

  if (!department) {
    throw new Error(
      `Department "${validatedTeacherData.department}" not found`,
    );
  }

  // Find designation by name/code
  const designation = await tx.designation.findFirst({
    where: {
      OR: [
        { name: validatedTeacherData.designation },
        { code: validatedTeacherData.designation },
      ],
    },
  });

  if (!designation) {
    throw new Error(
      `Designation "${validatedTeacherData.designation}" not found`,
    );
  }

  const teacher = await tx.teacherProfile.create({
    data: {
      departmentId: department.id,
      designationId: designation.id,
      userId: userId,
    },
  });

  return teacher;
};

const createStaffProfileService = async (
  tx: Tx,
  userId: string,
  staffData?: {
    department: string;
    position: string;
  },
) => {
  // Implementation for creating staff profile
  if (!staffData) {
    throw new Error("Staff data is required for creating staff profile");
  }

  const validatedStaffData = staffDataSchema.parse(staffData);

  // Find department by name/code
  const department = await tx.department.findFirst({
    where: {
      OR: [
        { name: validatedStaffData.department },
        { code: validatedStaffData.department },
      ],
    },
  });

  if (!department) {
    throw new Error(`Department "${validatedStaffData.department}" not found`);
  }

  // Find position by name/code
  const position = await tx.staffPosition.findFirst({
    where: {
      OR: [
        { name: validatedStaffData.position },
        { code: validatedStaffData.position },
      ],
    },
  });

  if (!position) {
    throw new Error(`Position "${validatedStaffData.position}" not found`);
  }

  const staff = await tx.staffProfile.create({
    data: {
      departmentId: department.id,
      positionId: position.id,
      userId: userId,
    },
  });

  return staff;
};

const createAdminProfileService = async (
  tx: Tx,
  userId: string,
  adminData?: {
    accessLevel: AdminLevelValue;
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
  role: RoleValue;

  studentData?: {
    rollNo: string;
    uid: string;
    department: string;
    semester: number;
    branch: string;
    section: string;
  };

  teacherData?: {
    department: string;
    designation: string;
  };

  staffData?: {
    department: string;
    position: string;
  };

  adminData?: {
    accessLevel: AdminLevelValue;
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
