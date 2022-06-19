/*
  Warnings:

  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `Id` on the `orders` table. All the data in the column will be lost.
  - Added the required column `order_id` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `orders` DROP PRIMARY KEY,
    DROP COLUMN `Id`,
    ADD COLUMN `order_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`order_id`);

-- CreateTable
CREATE TABLE `notifications` (
    `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(50) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `price` DECIMAL(10, 5) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `enable` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`notification_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_api_key_fkey` FOREIGN KEY (`api_key`) REFERENCES `Users`(`api_key`) ON DELETE RESTRICT ON UPDATE CASCADE;
