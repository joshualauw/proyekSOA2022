/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `post` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profile` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[nomor_telepon]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_key]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `api_key` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nomor_telepon` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- DropForeignKey
ALTER TABLE `profile` DROP FOREIGN KEY `Profile_userId_fkey`;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `api_key` VARCHAR(191) NOT NULL,
    ADD COLUMN `nomor_telepon` VARCHAR(191) NOT NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `tipe_user` ENUM('FREE', 'PREMIUM') NOT NULL DEFAULT 'FREE',
    ADD COLUMN `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `name` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`user_id`);

-- DropTable
DROP TABLE `post`;

-- DropTable
DROP TABLE `profile`;

-- CreateIndex
CREATE UNIQUE INDEX `User_nomor_telepon_key` ON `User`(`nomor_telepon`);

-- CreateIndex
CREATE UNIQUE INDEX `User_api_key_key` ON `User`(`api_key`);
