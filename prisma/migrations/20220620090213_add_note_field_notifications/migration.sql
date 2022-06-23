/*
  Warnings:

  - Added the required column `note` to the `notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notifications` ADD COLUMN `note` VARCHAR(255) NOT NULL;
