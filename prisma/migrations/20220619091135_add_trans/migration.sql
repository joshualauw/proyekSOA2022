-- CreateTable
CREATE TABLE `Transfer` (
    `trans_id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id_ref` INTEGER NOT NULL,
    `photo` VARCHAR(191) NOT NULL,
    `date_upload` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('pending', 'success') NOT NULL DEFAULT 'pending',

    UNIQUE INDEX `Transfer_photo_key`(`photo`),
    PRIMARY KEY (`trans_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
