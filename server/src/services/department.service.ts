import prisma from "../lib/prisma.js";

export const createDepartmentService = async (departmentName: string, code: string) => {
    const department = await prisma.department.create({
        data: {
            name: departmentName,
            code: code
        }
    });

    return department;
}

export const getAllDepartmentsService = async () =>{
    return await prisma.department.findMany();
}

export const deleteDepartmentService = async (departmentId: number) => {
    const department = await prisma.department.findUnique({
        where: {
            id: departmentId
        }
    });
    if (!department) {
        throw new Error("Department not found");
    }

    await prisma.department.update({
        where: {
            id: departmentId
        },
        data: {
            isActive: false,
            deletedAt: new Date(),
        }
    });
}

export const getDepartmentByIdService = async (departmentId: number) => {
    const department = await prisma.department.findUnique({
        where: {
            id: departmentId,
        },
    });

    return department;
}
