import prisma from "../lib/prisma.js";

export const createBranchService = async (branchName: string, code: string, isActive: boolean) => {
    return await prisma.branch.create({
        data: {
            name: branchName,
            code: code,
            isActive: true
        }
    });
};

export const getAllBranchesService = async () => {
    return await prisma.branch.findMany();
}

export const deleteBranchService = async (branchId: number) => {
    const branch = await prisma.branch.findUnique({
        where: {
            id: branchId
        }
    });
    if (!branch) {
        throw new Error("Branch not found");
    }
    
    await prisma.branch.update({
        where: {
            id: branchId
        },
        data: {
            isActive: false,
            deletedAt: new Date()
        }
    });
}

export const getBranchByIdService = async (branchId: number) => {
    const branch = await prisma.branch.findUnique({
        where:{
            id: branchId
        }
    });
    if (!branch) {
        throw new Error("Branch not found");
    }
    return branch;
}