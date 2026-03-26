import pagination from "../utils/pagination.utils.js";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";

export const getAllUsersService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);

  const where: Prisma.UserWhereInput = {};

  if (search && search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        email: {
          contains: search,
        },
      },
      {
        phone: {
          contains: search,
        },
      },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limits,
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  const totalUsers = await prisma.user.count({ where });

  return {
    data: users,
    pagination: {
      page: pages,
      limit: limits,
      total: totalUsers,
      totalPages: Math.ceil(totalUsers / limits),
    },
  };
};

export const getUserByIdService = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const deleteUserService = async (userId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.refreshToken.deleteMany({
      where: { userId },
    });

    await tx.studentProfile.deleteMany({
      where: { userId },
    });

    await tx.teacherProfile.deleteMany({
      where: { userId },
    });

    await tx.staffProfile.deleteMany({
      where: { userId },
    });

    await tx.adminProfile.deleteMany({
      where: { userId },
    });

    return await tx.user.delete({
      where: { id: userId },
    });
  });
};

export const getAllAdminService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);

  const where: Prisma.UserWhereInput = {
    role: "ADMIN",
  };

  if (search && search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        email: {
          contains: search,
        },
      },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const admins = await prisma.user.findMany({
    where,
    skip,
    take: limits,
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return admins;
};

export const getAllStaffService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);

  const where: Prisma.UserWhereInput = {
    role: "STAFF",
  };

  if (search && search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        email: {
          contains: search,
        },
      },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const staff = await prisma.user.findMany({
    where,
    skip,
    take: limits,
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return staff;
};

export const getAllTeachersService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);

  const where: Prisma.UserWhereInput = {
    role: "TEACHER",
  };

  if (search && search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const allTeachers = await prisma.user.findMany({
    where,
    skip,
    take: limits,
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return allTeachers;
};

export const getAllStudentsService = async (
  page: number,
  limit: number,
  search: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);

  const where: Prisma.UserWhereInput = {
    role: "STUDENT",
  };

  if (search && search.trim() !== "") {
    where.OR = [
      {
        name: {
          contains: search,
        },
      },
      {
        email: {
          contains: search,
        },
      },
    ];
  }

  const orderBy: Prisma.UserOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const students = await prisma.user.findMany({
    where,
    skip,
    take: limits,
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  return students;
};
