/*
  Warnings:

  - You are about to drop the column `location` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `searchTitle` on the `event` table. All the data in the column will be lost.
  - Added the required column `eventAddress` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketTypeName` to the `Tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event` DROP COLUMN `location`,
    DROP COLUMN `searchTitle`,
    ADD COLUMN `eventAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `locationId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `price` VARCHAR(191) NOT NULL,
    ADD COLUMN `ticketTypeName` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Location` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Location_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
