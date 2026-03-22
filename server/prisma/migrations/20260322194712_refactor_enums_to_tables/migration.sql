/*
  Warnings:

  - You are about to drop the column `department` on the `staffprofile` table. All the data in the column will be lost.
  - You are about to drop the column `position` on the `staffprofile` table. All the data in the column will be lost.
  - You are about to drop the column `branch` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `teacherprofile` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `teacherprofile` table. All the data in the column will be lost.
  - Added the required column `departmentId` to the `StaffProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `StaffProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StaffProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchDepartmentId` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `branchId` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departmentId` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `designationId` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `TeacherProfile` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `StudentProfile_rollNo_idx` ON `studentprofile`;

-- AlterTable
ALTER TABLE `adminprofile` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `staffprofile` DROP COLUMN `department`,
    DROP COLUMN `position`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `departmentId` INTEGER NOT NULL,
    ADD COLUMN `positionId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `studentprofile` DROP COLUMN `branch`,
    DROP COLUMN `department`,
    ADD COLUMN `branchDepartmentId` INTEGER NOT NULL,
    ADD COLUMN `branchId` INTEGER NOT NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `departmentId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `teacherprofile` DROP COLUMN `department`,
    DROP COLUMN `designation`,
    ADD COLUMN `deletedAt` DATETIME(3) NULL,
    ADD COLUMN `departmentId` INTEGER NOT NULL,
    ADD COLUMN `designationId` INTEGER NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `deletedAt` DATETIME(3) NULL,
    MODIFY `role` ENUM('STUDENT', 'TEACHER', 'ADMIN', 'STAFF') NOT NULL DEFAULT 'STUDENT';

-- CreateTable
CREATE TABLE `Branch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Branch_name_key`(`name`),
    UNIQUE INDEX `Branch_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Department_name_key`(`name`),
    UNIQUE INDEX `Department_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BranchDepartment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `branchId` INTEGER NOT NULL,
    `departmentId` INTEGER NOT NULL,

    UNIQUE INDEX `BranchDepartment_branchId_departmentId_key`(`branchId`, `departmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Designation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Designation_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StaffPosition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    UNIQUE INDEX `StaffPosition_name_key`(`name`),
    UNIQUE INDEX `StaffPosition_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Otp_email_type_idx` ON `Otp`(`email`, `type`);

-- CreateIndex
CREATE INDEX `StaffProfile_departmentId_idx` ON `StaffProfile`(`departmentId`);

-- CreateIndex
CREATE INDEX `StaffProfile_positionId_idx` ON `StaffProfile`(`positionId`);

-- CreateIndex
CREATE INDEX `StudentProfile_branchId_idx` ON `StudentProfile`(`branchId`);

-- CreateIndex
CREATE INDEX `StudentProfile_departmentId_idx` ON `StudentProfile`(`departmentId`);

-- CreateIndex
CREATE INDEX `StudentProfile_branchDepartmentId_idx` ON `StudentProfile`(`branchDepartmentId`);

-- CreateIndex
CREATE INDEX `TeacherProfile_departmentId_idx` ON `TeacherProfile`(`departmentId`);

-- CreateIndex
CREATE INDEX `TeacherProfile_designationId_idx` ON `TeacherProfile`(`designationId`);

-- CreateIndex
CREATE INDEX `User_phone_idx` ON `User`(`phone`);

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_branchDepartmentId_fkey` FOREIGN KEY (`branchDepartmentId`) REFERENCES `BranchDepartment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_designationId_fkey` FOREIGN KEY (`designationId`) REFERENCES `Designation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffProfile` ADD CONSTRAINT `StaffProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffProfile` ADD CONSTRAINT `StaffProfile_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `StaffPosition`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchDepartment` ADD CONSTRAINT `BranchDepartment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchDepartment` ADD CONSTRAINT `BranchDepartment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
