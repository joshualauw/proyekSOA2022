-- CreateTable
CREATE TABLE `orders` (
    `Id` INTEGER NOT NULL AUTO_INCREMENT,
    `symbol` VARCHAR(50) NOT NULL,
    `api_key` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `price` DECIMAL(10, 5) NOT NULL DEFAULT 0,
    `qty` DECIMAL(10, 5) NOT NULL,
    `fill_price` DECIMAL(10, 5) NOT NULL DEFAULT 0,
    `buy` BOOLEAN NOT NULL,
    `cancel` BOOLEAN NOT NULL DEFAULT false,
    `type` VARCHAR(50) NOT NULL,

    PRIMARY KEY (`Id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_api_key_fkey` FOREIGN KEY (`api_key`) REFERENCES `Users`(`api_key`) ON DELETE RESTRICT ON UPDATE CASCADE;
