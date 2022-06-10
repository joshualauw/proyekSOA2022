/*
  Warnings:

  - The primary key for the `watchlist` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avg` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `change` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `change_percent` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `high` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `last_price` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `low` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `stock_id` on the `watchlist` table. All the data in the column will be lost.
  - You are about to drop the column `volume` on the `watchlist` table. All the data in the column will be lost.
  - Added the required column `watchlist_id` to the `Watchlist` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `watchlist` DROP PRIMARY KEY,
    DROP COLUMN `avg`,
    DROP COLUMN `change`,
    DROP COLUMN `change_percent`,
    DROP COLUMN `high`,
    DROP COLUMN `last_price`,
    DROP COLUMN `low`,
    DROP COLUMN `stock_id`,
    DROP COLUMN `volume`,
    ADD COLUMN `watchlist_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`watchlist_id`);
