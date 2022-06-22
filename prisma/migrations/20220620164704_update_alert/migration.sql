/*
  Warnings:

  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_api_key_fkey`;

-- DropForeignKey
ALTER TABLE `orders` DROP FOREIGN KEY `orders_api_key_fkey`;

-- DropTable
DROP TABLE `notifications`;

-- CreateTable
CREATE TABLE `Alerts` (
    `alert_id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(50) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `type` ENUM('above', 'below') NOT NULL,
    `price` DECIMAL(10, 5) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `note` VARCHAR(255) NOT NULL,
    `enable` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`alert_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Orders` ADD CONSTRAINT `Orders_api_key_fkey` FOREIGN KEY (`api_key`) REFERENCES `Users`(`api_key`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Alerts` ADD CONSTRAINT `Alerts_api_key_fkey` FOREIGN KEY (`api_key`) REFERENCES `Users`(`api_key`) ON DELETE RESTRICT ON UPDATE CASCADE;
