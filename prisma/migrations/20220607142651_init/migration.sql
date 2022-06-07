/*
  Warnings:

  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `user`;

-- CreateTable
CREATE TABLE `Users` (
    `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `nomor_telepon` VARCHAR(191) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `tipe_user` ENUM('free', 'premium') NOT NULL DEFAULT 'free',

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_nomor_telepon_key`(`nomor_telepon`),
    UNIQUE INDEX `Users_api_key_key`(`api_key`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
