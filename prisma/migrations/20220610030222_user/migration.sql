/*
  Warnings:

  - The primary key for the `watchlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `stock_id` on the `watchlist` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `api_key` to the `Watchlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `watchlist` DROP PRIMARY KEY,
    ADD COLUMN `api_key` VARCHAR(191) NOT NULL,
    MODIFY `stock_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`stock_id`);

-- AddForeignKey
ALTER TABLE `Watchlist` ADD CONSTRAINT `Watchlist_api_key_fkey` FOREIGN KEY (`api_key`) REFERENCES `Users`(`api_key`) ON DELETE RESTRICT ON UPDATE CASCADE;
