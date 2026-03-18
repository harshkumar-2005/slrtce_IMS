/*
  Warnings:

  - You are about to alter the column `accessLevel` on the `adminprofile` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Enum(EnumId(5))`.
  - You are about to alter the column `position` on the `staffprofile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(7))`.
  - You are about to drop the column `branch` on the `user` table. All the data in the column will be lost.
  - Added the required column `branch` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Made the column `designation` on table `teacherprofile` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `adminprofile` DROP FOREIGN KEY `AdminProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `staffprofile` DROP FOREIGN KEY `StaffProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `studentprofile` DROP FOREIGN KEY `StudentProfile_userId_fkey`;

-- DropForeignKey
ALTER TABLE `teacherprofile` DROP FOREIGN KEY `TeacherProfile_userId_fkey`;

-- AlterTable
ALTER TABLE `adminprofile` MODIFY `accessLevel` ENUM('NORMAL', 'SUPER') NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE `refreshtoken` ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `replacedByToken` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `staffprofile` MODIFY `position` ENUM('CLERK', 'LAB_ASSISTANT', 'LIBRARIAN', 'TECHNICIAN') NOT NULL;

-- AlterTable
ALTER TABLE `studentprofile` ADD COLUMN `branch` ENUM('CSE', 'ECS', 'ECE', 'MECH', 'CIVIL', 'EEE') NOT NULL,
    ADD COLUMN `section` VARCHAR(191) NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `teacherprofile` MODIFY `designation` ENUM('PROFESSOR', 'ASSISTANT_PROFESSOR', 'HOD', 'LECTURER') NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `branch`,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX `RefreshToken_token_idx` ON `RefreshToken`(`token`);

-- CreateIndex
CREATE INDEX `StudentProfile_rollNo_idx` ON `StudentProfile`(`rollNo`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdminProfile` ADD CONSTRAINT `AdminProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffProfile` ADD CONSTRAINT `StaffProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
