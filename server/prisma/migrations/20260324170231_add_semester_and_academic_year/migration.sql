/*
  Warnings:

  - You are about to drop the column `semester` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `studentprofile` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `subject` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `subject` table. All the data in the column will be lost.
  - You are about to drop the column `semester` on the `teachersubject` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `teachersubject` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code,branchDepartmentId,semesterId]` on the table `Subject` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[teacherId,subjectId,semesterId,section]` on the table `TeacherSubject` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `semesterId` to the `StudentProfile` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterId` to the `Subject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `semesterId` to the `TeacherSubject` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `teachersubject` DROP FOREIGN KEY `TeacherSubject_teacherId_fkey`;

-- DropIndex
DROP INDEX `Subject_code_branchDepartmentId_semester_key` ON `subject`;

-- DropIndex
DROP INDEX `Subject_semester_year_idx` ON `subject`;

-- DropIndex
DROP INDEX `TeacherSubject_teacherId_subjectId_semester_year_section_key` ON `teachersubject`;

-- AlterTable
ALTER TABLE `studentprofile` DROP COLUMN `semester`,
    DROP COLUMN `year`,
    ADD COLUMN `semesterId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `subject` DROP COLUMN `semester`,
    DROP COLUMN `year`,
    ADD COLUMN `semesterId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `teachersubject` DROP COLUMN `semester`,
    DROP COLUMN `year`,
    ADD COLUMN `semesterId` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `AcademicYear` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Semester` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `number` INTEGER NOT NULL,
    `status` ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'UPCOMING',
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `academicYearId` VARCHAR(191) NOT NULL,
    `branchDepartmentId` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Subject_semesterId_idx` ON `Subject`(`semesterId`);

-- CreateIndex
CREATE UNIQUE INDEX `Subject_code_branchDepartmentId_semesterId_key` ON `Subject`(`code`, `branchDepartmentId`, `semesterId`);

-- CreateIndex
CREATE UNIQUE INDEX `TeacherSubject_teacherId_subjectId_semesterId_section_key` ON `TeacherSubject`(`teacherId`, `subjectId`, `semesterId`, `section`);

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Semester` ADD CONSTRAINT `Semester_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Semester` ADD CONSTRAINT `Semester_branchDepartmentId_fkey` FOREIGN KEY (`branchDepartmentId`) REFERENCES `BranchDepartment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherSubject` ADD CONSTRAINT `TeacherSubject_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
