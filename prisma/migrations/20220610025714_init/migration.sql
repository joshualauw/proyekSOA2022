-- CreateTable
CREATE TABLE `Watchlist` (
    `stock_id` VARCHAR(191) NOT NULL,
    `symbol` VARCHAR(191) NOT NULL,
    `last_price` DOUBLE NOT NULL,
    `change` DOUBLE NOT NULL,
    `change_percent` DOUBLE NOT NULL,
    `volume` VARCHAR(191) NOT NULL,
    `avg` DOUBLE NOT NULL,
    `high` DOUBLE NOT NULL,
    `low` DOUBLE NOT NULL,

    PRIMARY KEY (`stock_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
