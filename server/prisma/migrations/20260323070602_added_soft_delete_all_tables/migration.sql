/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Designation` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Designation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `designation` ADD COLUMN `code` VARCHAR(191) NOT NULL,
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `staffposition` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `staffprofile` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `studentprofile` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `teacherprofile` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `Designation_code_key` ON `Designation`(`code`);
