-- DropIndex
DROP INDEX `events_club_id_is_published_idx` ON `events`;

-- AlterTable
ALTER TABLE `events` ADD COLUMN `attachment_name` VARCHAR(200) NULL,
    ADD COLUMN `attachment_url` VARCHAR(500) NULL,
    ADD COLUMN `original_date` DATETIME(3) NULL,
    ADD COLUMN `postponed_date` DATETIME(3) NULL,
    ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'draft';

-- CreateIndex
CREATE INDEX `events_club_id_status_idx` ON `events`(`club_id`, `status`);
