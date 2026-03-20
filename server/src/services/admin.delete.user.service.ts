import prisma from "../lib/prisma.js";

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
