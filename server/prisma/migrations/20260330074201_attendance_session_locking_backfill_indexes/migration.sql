-- Extend AttendanceSession for locking/backfill and deterministic session creation
ALTER TABLE `AttendanceSession`
  ADD COLUMN `autoLockAt` DATETIME(3) NULL,
  ADD COLUMN `graceMinutes` INTEGER NOT NULL DEFAULT 10,
  ADD COLUMN `isBackfill` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `isLocked` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `lockReason` VARCHAR(191) NULL,
  ADD COLUMN `lockedAt` DATETIME(3) NULL,
  ADD COLUMN `subjectType` ENUM('THEORY', 'PRACTICAL', 'LAB') NOT NULL DEFAULT 'THEORY';

-- Backfill nullable historical rows before tightening constraints
UPDATE `AttendanceSession`
SET
  `startTime` = COALESCE(`startTime`, `date`),
  `endTime` = COALESCE(`endTime`, DATE_ADD(COALESCE(`startTime`, `date`), INTERVAL 60 MINUTE));

UPDATE `AttendanceSession`
SET `autoLockAt` = DATE_ADD(`endTime`, INTERVAL 15 MINUTE)
WHERE `autoLockAt` IS NULL;

ALTER TABLE `AttendanceSession`
  MODIFY `startTime` DATETIME(3) NOT NULL,
  MODIFY `endTime` DATETIME(3) NOT NULL,
  MODIFY `autoLockAt` DATETIME(3) NOT NULL,
  ALTER COLUMN `subjectType` DROP DEFAULT;

DROP INDEX `AttendanceSession_subjectId_semesterId_teacherId_date_startT_key` ON `AttendanceSession`;

CREATE INDEX `AttendanceSession_teacherId_date_startTime_endTime_idx`
  ON `AttendanceSession`(`teacherId`, `date`, `startTime`, `endTime`);

CREATE INDEX `AttendanceSession_teacherId_isLocked_autoLockAt_idx`
  ON `AttendanceSession`(`teacherId`, `isLocked`, `autoLockAt`);

CREATE UNIQUE INDEX `AttendanceSession_teacherId_subjectId_date_startTime_section_key`
  ON `AttendanceSession`(`teacherId`, `subjectId`, `date`, `startTime`, `section`);
