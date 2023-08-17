/*
  Warnings:

  - You are about to drop the column `price` on the `event` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[eventName,date]` on the table `PendingEvent` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `categoryTypeId` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceLabel` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketPriceEntity` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryTypeId` to the `PendingEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketPriceEntity` to the `PendingEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryTypeId` to the `Tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `event` DROP COLUMN `price`,
    ADD COLUMN `categoryTypeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `priceLabel` VARCHAR(191) NOT NULL,
    ADD COLUMN `ticketPriceEntity` JSON NOT NULL;

-- AlterTable
ALTER TABLE `pendingevent` ADD COLUMN `categoryTypeId` VARCHAR(191) NOT NULL,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ticketPriceEntity` JSON NOT NULL;

-- AlterTable
ALTER TABLE `tickets` ADD COLUMN `categoryTypeId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `PendingEvent_eventName_date_key` ON `PendingEvent`(`eventName`, `date`);

-- AddForeignKey
ALTER TABLE `Event` ADD CONSTRAINT `Event_categoryTypeId_fkey` FOREIGN KEY (`categoryTypeId`) REFERENCES `CategoryType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PendingEvent` ADD CONSTRAINT `PendingEvent_categoryTypeId_fkey` FOREIGN KEY (`categoryTypeId`) REFERENCES `CategoryType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Tickets` ADD CONSTRAINT `Tickets_categoryTypeId_fkey` FOREIGN KEY (`categoryTypeId`) REFERENCES `CategoryType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
