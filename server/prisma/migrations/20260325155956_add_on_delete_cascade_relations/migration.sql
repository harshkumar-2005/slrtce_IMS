-- DropForeignKey
ALTER TABLE `branchdepartment` DROP FOREIGN KEY `BranchDepartment_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `branchdepartment` DROP FOREIGN KEY `BranchDepartment_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `semester` DROP FOREIGN KEY `Semester_academicYearId_fkey`;

-- DropForeignKey
ALTER TABLE `semester` DROP FOREIGN KEY `Semester_branchDepartmentId_fkey`;

-- DropForeignKey
ALTER TABLE `staffprofile` DROP FOREIGN KEY `StaffProfile_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `staffprofile` DROP FOREIGN KEY `StaffProfile_positionId_fkey`;

-- DropForeignKey
ALTER TABLE `studentprofile` DROP FOREIGN KEY `StudentProfile_branchDepartmentId_fkey`;

-- DropForeignKey
ALTER TABLE `studentprofile` DROP FOREIGN KEY `StudentProfile_branchId_fkey`;

-- DropForeignKey
ALTER TABLE `studentprofile` DROP FOREIGN KEY `StudentProfile_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `studentprofile` DROP FOREIGN KEY `StudentProfile_semesterId_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `Subject_branchDepartmentId_fkey`;

-- DropForeignKey
ALTER TABLE `subject` DROP FOREIGN KEY `Subject_semesterId_fkey`;

-- DropForeignKey
ALTER TABLE `teacherprofile` DROP FOREIGN KEY `TeacherProfile_departmentId_fkey`;

-- DropForeignKey
ALTER TABLE `teacherprofile` DROP FOREIGN KEY `TeacherProfile_designationId_fkey`;

-- DropForeignKey
ALTER TABLE `teachersubject` DROP FOREIGN KEY `TeacherSubject_semesterId_fkey`;

-- DropForeignKey
ALTER TABLE `teachersubject` DROP FOREIGN KEY `TeacherSubject_subjectId_fkey`;

-- DropIndex
DROP INDEX `BranchDepartment_departmentId_fkey` ON `branchdepartment`;

-- DropIndex
DROP INDEX `Semester_academicYearId_fkey` ON `semester`;

-- DropIndex
DROP INDEX `Semester_branchDepartmentId_fkey` ON `semester`;

-- DropIndex
DROP INDEX `StudentProfile_semesterId_fkey` ON `studentprofile`;

-- DropIndex
DROP INDEX `Subject_branchDepartmentId_fkey` ON `subject`;

-- DropIndex
DROP INDEX `TeacherSubject_semesterId_fkey` ON `teachersubject`;

-- DropIndex
DROP INDEX `TeacherSubject_subjectId_fkey` ON `teachersubject`;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_branchDepartmentId_fkey` FOREIGN KEY (`branchDepartmentId`) REFERENCES `BranchDepartment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StudentProfile` ADD CONSTRAINT `StudentProfile_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherProfile` ADD CONSTRAINT `TeacherProfile_designationId_fkey` FOREIGN KEY (`designationId`) REFERENCES `Designation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffProfile` ADD CONSTRAINT `StaffProfile_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StaffProfile` ADD CONSTRAINT `StaffProfile_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `StaffPosition`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Semester` ADD CONSTRAINT `Semester_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Semester` ADD CONSTRAINT `Semester_branchDepartmentId_fkey` FOREIGN KEY (`branchDepartmentId`) REFERENCES `BranchDepartment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchDepartment` ADD CONSTRAINT `BranchDepartment_branchId_fkey` FOREIGN KEY (`branchId`) REFERENCES `Branch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BranchDepartment` ADD CONSTRAINT `BranchDepartment_departmentId_fkey` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_branchDepartmentId_fkey` FOREIGN KEY (`branchDepartmentId`) REFERENCES `BranchDepartment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subject` ADD CONSTRAINT `Subject_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherSubject` ADD CONSTRAINT `TeacherSubject_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `TeacherProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherSubject` ADD CONSTRAINT `TeacherSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeacherSubject` ADD CONSTRAINT `TeacherSubject_semesterId_fkey` FOREIGN KEY (`semesterId`) REFERENCES `Semester`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
