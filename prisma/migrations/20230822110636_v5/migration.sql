/*
  Warnings:

  - You are about to drop the column `location` on the `pendingevent` table. All the data in the column will be lost.
  - Added the required column `eventAddress` to the `PendingEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationId` to the `PendingEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `pendingevent` DROP COLUMN `location`,
    ADD COLUMN `eventAddress` VARCHAR(191) NOT NULL,
    ADD COLUMN `locationId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `PendingEvent` ADD CONSTRAINT `PendingEvent_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
