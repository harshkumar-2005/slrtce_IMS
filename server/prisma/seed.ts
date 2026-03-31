import "dotenv/config";
import argon2 from "argon2";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  AdminLevel,
  PrismaClient,
  Role,
  SemesterStatus,
  SubjectType,
} from "@prisma/client";

const runtimeProcess = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process;
const databaseUrl = runtimeProcess?.env?.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Set it in your environment before running seed.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb(databaseUrl),
  log: ["warn", "error"],
});

async function main() {
  const seedPassword =
    runtimeProcess?.env?.SEED_USER_PASSWORD ?? "ChangeMe@123";
  const hashedPassword = await argon2.hash(seedPassword);

  const branch = await prisma.branch.upsert({
    where: { code: "CSE" },
    update: {
      name: "Computer Science",
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Computer Science",
      code: "CSE",
      isActive: true,
    },
  });

  const department = await prisma.department.upsert({
    where: { code: "ENG" },
    update: {
      name: "Engineering",
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Engineering",
      code: "ENG",
      isActive: true,
    },
  });

  const branchDepartment = await prisma.branchDepartment.upsert({
    where: {
      branchId_departmentId: {
        branchId: branch.id,
        departmentId: department.id,
      },
    },
    update: {
      isActive: true,
      deletedAt: null,
    },
    create: {
      branchId: branch.id,
      departmentId: department.id,
      isActive: true,
    },
  });

  const designation = await prisma.designation.upsert({
    where: { code: "AP" },
    update: {
      name: "Assistant Professor",
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Assistant Professor",
      code: "AP",
      isActive: true,
    },
  });

  const staffPosition = await prisma.staffPosition.upsert({
    where: { code: "CLERK" },
    update: {
      name: "Office Clerk",
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Office Clerk",
      code: "CLERK",
      isActive: true,
    },
  });

  let academicYear = await prisma.academicYear.findFirst({
    where: { name: "2025-2026" },
  });

  if (!academicYear) {
    academicYear = await prisma.academicYear.create({
      data: {
        name: "2025-2026",
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        endDate: new Date("2026-05-31T23:59:59.999Z"),
      },
    });
  }

  let semester = await prisma.semester.findFirst({
    where: {
      number: 1,
      academicYearId: academicYear.id,
      branchDepartmentId: branchDepartment.id,
    },
  });

  if (!semester) {
    semester = await prisma.semester.create({
      data: {
        name: "Sem 1",
        number: 1,
        status: SemesterStatus.ACTIVE,
        startDate: new Date("2025-06-01T00:00:00.000Z"),
        endDate: new Date("2025-11-30T23:59:59.999Z"),
        academicYearId: academicYear.id,
        branchDepartmentId: branchDepartment.id,
        isActive: true,
      },
    });
  }

  const subject = await prisma.subject.upsert({
    where: {
      code_branchDepartmentId_semesterId: {
        code: "CS101",
        branchDepartmentId: branchDepartment.id,
        semesterId: semester.id,
      },
    },
    update: {
      name: "Programming Fundamentals",
      credits: 4,
      type: SubjectType.THEORY,
      isActive: true,
      deletedAt: null,
    },
    create: {
      name: "Programming Fundamentals",
      code: "CS101",
      branchDepartmentId: branchDepartment.id,
      semesterId: semester.id,
      credits: 4,
      type: SubjectType.THEORY,
      isActive: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@slrtce.local" },
    update: {
      name: "System Admin",
      phone: "9000000001",
      password: hashedPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
      deletedAt: null,
    },
    create: {
      email: "admin@slrtce.local",
      password: hashedPassword,
      name: "System Admin",
      phone: "9000000001",
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.adminProfile.upsert({
    where: { userId: adminUser.id },
    update: {
      accessLevel: AdminLevel.SUPER,
      deletedAt: null,
    },
    create: {
      userId: adminUser.id,
      accessLevel: AdminLevel.SUPER,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher1@slrtce.local" },
    update: {
      name: "Teacher One",
      phone: "9000000002",
      password: hashedPassword,
      role: Role.TEACHER,
      isActive: true,
      isEmailVerified: true,
      deletedAt: null,
    },
    create: {
      email: "teacher1@slrtce.local",
      password: hashedPassword,
      name: "Teacher One",
      phone: "9000000002",
      role: Role.TEACHER,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const teacherProfile = await prisma.teacherProfile.upsert({
    where: { userId: teacherUser.id },
    update: {
      departmentId: department.id,
      designationId: designation.id,
      deletedAt: null,
    },
    create: {
      userId: teacherUser.id,
      departmentId: department.id,
      designationId: designation.id,
    },
  });

  const teacherSubject = await prisma.teacherSubject.findFirst({
    where: {
      teacherId: teacherProfile.id,
      subjectId: subject.id,
      semesterId: semester.id,
      section: "A",
    },
  });

  if (!teacherSubject) {
    await prisma.teacherSubject.create({
      data: {
        teacherId: teacherProfile.id,
        subjectId: subject.id,
        semesterId: semester.id,
        section: "A",
      },
    });
  }

  const staffUser = await prisma.user.upsert({
    where: { email: "staff1@slrtce.local" },
    update: {
      name: "Staff One",
      phone: "9000000003",
      password: hashedPassword,
      role: Role.STAFF,
      isActive: true,
      isEmailVerified: true,
      deletedAt: null,
    },
    create: {
      email: "staff1@slrtce.local",
      password: hashedPassword,
      name: "Staff One",
      phone: "9000000003",
      role: Role.STAFF,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.staffProfile.upsert({
    where: { userId: staffUser.id },
    update: {
      departmentId: department.id,
      positionId: staffPosition.id,
      deletedAt: null,
    },
    create: {
      userId: staffUser.id,
      departmentId: department.id,
      positionId: staffPosition.id,
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student1@slrtce.local" },
    update: {
      name: "Student One",
      phone: "9000000004",
      password: hashedPassword,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
      deletedAt: null,
    },
    create: {
      email: "student1@slrtce.local",
      password: hashedPassword,
      name: "Student One",
      phone: "9000000004",
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {
      uid: "202600000001",
      rollNo: "1001",
      branchId: branch.id,
      departmentId: department.id,
      branchDepartmentId: branchDepartment.id,
      semesterId: semester.id,
      section: "A",
      deletedAt: null,
    },
    create: {
      userId: studentUser.id,
      uid: "202600000001",
      rollNo: "1001",
      branchId: branch.id,
      departmentId: department.id,
      branchDepartmentId: branchDepartment.id,
      semesterId: semester.id,
      section: "A",
    },
  });

  console.log("Seed completed successfully.");
  console.log("Login users created/updated:");
  console.log("- admin@slrtce.local (ADMIN)");
  console.log("- teacher1@slrtce.local (TEACHER)");
  console.log("- staff1@slrtce.local (STAFF)");
  console.log("- student1@slrtce.local (STUDENT)");
  console.log(`Password for all users: ${seedPassword}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
