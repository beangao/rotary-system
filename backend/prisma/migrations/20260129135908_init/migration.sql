-- CreateTable
CREATE TABLE `clubs` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `name_kana` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `logo_url` VARCHAR(500) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `super_admins` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `super_admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `club_admins` (
    `id` VARCHAR(191) NOT NULL,
    `club_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `role` VARCHAR(50) NOT NULL DEFAULT 'admin',
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `club_admins_club_id_email_key`(`club_id`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` VARCHAR(191) NOT NULL,
    `club_id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `verification_code` VARCHAR(6) NULL,
    `verification_code_expiry` DATETIME(3) NULL,
    `member_number` VARCHAR(50) NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name_kana` VARCHAR(50) NULL,
    `first_name_kana` VARCHAR(50) NULL,
    `gender` VARCHAR(10) NULL,
    `birth_date` DATE NULL,
    `position` VARCHAR(100) NULL,
    `join_date` DATE NULL,
    `industry_classification` VARCHAR(100) NULL,
    `company_name` VARCHAR(200) NULL,
    `department` VARCHAR(100) NULL,
    `phone_number` VARCHAR(20) NULL,
    `avatar_url` VARCHAR(500) NULL,
    `hobbies` TEXT NULL,
    `introduction` TEXT NULL,
    `privacy_settings` TEXT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'invited',
    `profile_completed` BOOLEAN NOT NULL DEFAULT false,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `members_club_id_status_idx`(`club_id`, `status`),
    INDEX `members_club_id_last_name_first_name_idx`(`club_id`, `last_name`, `first_name`),
    UNIQUE INDEX `members_club_id_email_key`(`club_id`, `email`),
    UNIQUE INDEX `members_club_id_member_number_key`(`club_id`, `member_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `events` (
    `id` VARCHAR(191) NOT NULL,
    `club_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `description` TEXT NULL,
    `event_type` VARCHAR(50) NOT NULL,
    `start_at` DATETIME(3) NOT NULL,
    `end_at` DATETIME(3) NULL,
    `venue` VARCHAR(200) NULL,
    `venue_address` TEXT NULL,
    `online_url` VARCHAR(500) NULL,
    `response_deadline` DATETIME(3) NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `events_club_id_start_at_idx`(`club_id`, `start_at`),
    INDEX `events_club_id_is_published_idx`(`club_id`, `is_published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` VARCHAR(191) NOT NULL,
    `member_id` VARCHAR(191) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `comment` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendances_event_id_member_id_key`(`event_id`, `member_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `club_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(50) NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `notifications_club_id_is_published_published_at_idx`(`club_id`, `is_published`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `club_admins` ADD CONSTRAINT `club_admins_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `events` ADD CONSTRAINT `events_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_member_id_fkey` FOREIGN KEY (`member_id`) REFERENCES `members`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_club_id_fkey` FOREIGN KEY (`club_id`) REFERENCES `clubs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
