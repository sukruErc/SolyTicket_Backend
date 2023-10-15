/*
  Warnings:

  - Added the required column `tokenId` to the `MemoryTicket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `memoryticket` ADD COLUMN `tokenId` INTEGER NOT NULL;
