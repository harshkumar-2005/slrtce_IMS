import prisma from "../lib/prisma.js";
import pagination from "../utils/pagination.utils.js";
import validBranchDepartmentMapping from "../validators/branchDepartment.map.validator.js";

export const createBranchDepartmentMapping = async (
  branchId: number,
  departmentId: number,
) => {
  if (!branchId || !departmentId) {
    throw new Error("BranchId and DepartmentId are required");
  }

  const existing = await prisma.branchDepartment.findUnique({
    where: {
      branchId_departmentId: {
        branchId,
        departmentId,
      },
    },
  });

  if (existing) throw new Error("Mapping already exists");

  const validationResult = validBranchDepartmentMapping.safeParse({
    branchId,
    departmentId,
  });
  if (!validationResult.success) {
    throw new Error("Invalid input data");
  }

  const [branch, department] = await Promise.all([
    prisma.branch.findUnique({ where: { id: branchId } }),
    prisma.department.findUnique({ where: { id: departmentId } }),
  ]);

  if (!branch) throw new Error("Branch not found");
  if (!department) throw new Error("Department not found");

  return await prisma.branchDepartment.create({
    data: {
      branchId,
      departmentId,
    },
  });
};

export const getAllBranchDepartmentMappings = async (
  page: number,
  limit: number,
  search?: string,
) => {
  const { pages, limits, skip } = pagination(page, limit);
  const where: any = {
    isActive: true,
  };

  if (search && search.trim() !== "") {
    where.OR = [
      {
        branch: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
      {
        department: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  const mappings = await prisma.branchDepartment.findMany({
    where,
    include: {
      branch: {
        select: { id: true, name: true, code: true },
      },
      department: {
        select: { id: true, name: true, code: true },
      },
    },
    skip,
    take: limits,
  });

  const total = await prisma.branchDepartment.count({ where });

  return {
    data: mappings,
    totalPages: Math.ceil(total / limit),
  };
};

export const getBranchDepartmentByIdMapping = async (
  branchDepatmentId: number,
) => {
  const mapping = await prisma.branchDepartment.findFirst({
    where: {
      id: branchDepatmentId,
      isActive: true,
    },
  });

  return mapping;
};

export const updateBranchDepartmentMapping = async (
  branchDepatmentId: number,
  branchId: number,
  departmentId: number,
) => {
  const validationResult = validBranchDepartmentMapping.safeParse({
    branchId,
    departmentId,
  });
  if (!validationResult.success) {
    throw new Error("Invalid input data");
  }

  const existing = await prisma.branchDepartment.findFirst({
    where: {
      id: branchDepatmentId,
      isActive: true,
    },
  });

  if (!existing) throw new Error("Mapping not found or deleted");

  const [branch, department] = await Promise.all([
    prisma.branch.findUnique({ where: { id: branchId, isActive: true } }),
    prisma.department.findUnique({
      where: { id: departmentId, isActive: true },
    }),
  ]);

  if (!branch) throw new Error("Branch not found");
  if (!department) throw new Error("Department not found");

  return await prisma.branchDepartment.update({
    where: {
      id: branchDepatmentId,
    },
    data: {
      branchId,
      departmentId,
      updatedAt: new Date(),
    },
  });
};

export const deleteBranchDepartmentMapping = async (
  branchDepatmentId: number,
) => {
  return await prisma.branchDepartment.update({
    where: {
      id: branchDepatmentId,
    },
    data: {
      isActive: false,
      deletedAt: new Date(),
    },
  });
};
