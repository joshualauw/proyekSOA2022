/*
  Warnings:

  - You are about to alter the column `tipe_user` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum("user_tipe_user")` to `Enum("User_tipe_user")`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `tipe_user` ENUM('free', 'premium') NOT NULL DEFAULT 'free';
