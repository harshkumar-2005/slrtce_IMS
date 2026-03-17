/*
  Warnings:

  - You are about to alter the column `department` on the `studentprofile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - You are about to alter the column `department` on the `teacherprofile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `studentprofile` MODIFY `department` ENUM('COMPUTER_SCIENCE', 'ELECTRONICS', 'MECHANICAL', 'CIVIL', 'ELECTRICAL', 'SCIENCE', 'ADMINISTRATION') NOT NULL;

-- AlterTable
ALTER TABLE `teacherprofile` MODIFY `department` ENUM('COMPUTER_SCIENCE', 'ELECTRONICS', 'MECHANICAL', 'CIVIL', 'ELECTRICAL', 'SCIENCE', 'ADMINISTRATION') NOT NULL;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    INDEX `RefreshToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `StudentProfile_userId_idx` ON `StudentProfile`(`userId`);

-- CreateIndex
CREATE INDEX `TeacherProfile_userId_idx` ON `TeacherProfile`(`userId`);

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
