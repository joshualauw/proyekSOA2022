/*
  Warnings:

  - You are about to alter the column `type` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum("notifications_type")`.
  - You are about to alter the column `type` on the `orders` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum("orders_type")`.

*/
-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('above', 'below') NOT NULL;

-- AlterTable
ALTER TABLE `orders` MODIFY `type` ENUM('limit', 'market') NOT NULL;
