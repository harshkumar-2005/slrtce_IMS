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

export const userByIdSerice = async (id: string) => {
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
