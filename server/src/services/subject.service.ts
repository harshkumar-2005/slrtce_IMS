import prisma from "../lib/prisma.js";
import { SubjectType } from "@prisma/client";
import pagination from "../utils/pagination.utils.js";
import { Prisma } from "@prisma/client";
import subjectValidation from "../validators/subject.validator.js";

export const createSubjectService = async (
  name: string,
  code: string,
  branchDepartmentId: number,
  credits: number,
  type: SubjectType,
  semesterId: string,
) => {

  const existingSubject = await prisma.subject.findFirst({
    where: {
      name,
      code,
      branchDepartmentId,
      type,
      semesterId,
    },
  });

  if (existingSubject) {
    throw new Error("Subject already exists");
  }

      const Subject = subjectValidation.safeParse({
        name,
        code,
        branchDepartmentId,
        credits,
        type,
        semesterId,
      });
  
      if (!Subject.success) {
        throw new Error("Invalid subject data");
      }

  const subject = await prisma.subject.create({
    data: {
      branchDepartmentId,
      code,
      credits,
      name,
      semesterId,
      type,
    },
  });

  return subject;
};

export const getAllSubjectsService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);

  const where: Prisma.SubjectWhereInput = {};

  if (search && search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        code: {
          contains: search,
        },
      },
    ];
  }

  const orderBy: Prisma.SubjectOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const subjects = await prisma.subject.findMany({
    where,
    skip,
    take: limits,
    orderBy,
    select: {
      id: true,
      name: true,
      code: true,
      credits: true,
      type: true,
      createdAt: true,
    },
  });

  return subjects;
};

export const getSubjectByIdService = async (id: number) => {
  return await prisma.subject.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      code: true,
      credits: true,
      type: true,
      createdAt: true,
    },
  });
};

export const updateSubjectService = async (
  id: number,
  name: string,
  code: string,
  branchDepartmentId: number,
  credits: number,
  type: SubjectType,
  semesterId: string,
) => {
  const subject = await prisma.subject.update({
    where: {
      id,
    },
    data: {
      name,
      code,
      branchDepartmentId,
      credits,
      type,
      semesterId,
    },
  });
  return subject;
};

export const deleteSubjectService = async (id: number) => {
  await prisma.subject.update({
    where: {
      id,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};

export const assignTeacherToSubjectService = async (
  semesterId: string,
  subjectId: number,
  teacherId: number,
  section?: string,
) => {
  await prisma.teacherSubject.create({
    data: {
      section,
      semesterId,
      subjectId,
      teacherId,
    },
  });
};

export const deassignTeacherFromSubjectService = async (
  semesterId: string,
  subjectId: number,
  teacherId: number,
  section?: string,
) => {
  await prisma.teacherSubject.deleteMany({
    where: {
      section,
      semesterId,
      subjectId,
      teacherId,
    },
  });
};

export const getSubjectsByTeacherIdService = async (
  teacherId: number,
  semesterId: string,
) => {
  const subjectsId = await prisma.teacherSubject.findMany({
    where: {
      teacherId,
      semesterId,
    },
  });

  const subjects = await prisma.subject.findMany({
    where: {
      id: {
        in: subjectsId.map((s) => s.subjectId),
      },
    },
  });

  return subjects;
};
