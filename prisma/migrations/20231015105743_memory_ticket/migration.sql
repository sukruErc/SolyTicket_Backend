-- CreateTable
CREATE TABLE `MemoryTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` VARCHAR(191) NOT NULL,
    `smartContractId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SmartContract` (
    `id` VARCHAR(191) NOT NULL,
    `activityName` VARCHAR(191) NOT NULL,
    `contractAdress` VARCHAR(191) NOT NULL,
    `contractCapacity` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MemoryTicket` ADD CONSTRAINT `MemoryTicket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MemoryTicket` ADD CONSTRAINT `MemoryTicket_smartContractId_fkey` FOREIGN KEY (`smartContractId`) REFERENCES `SmartContract`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
