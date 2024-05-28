/*
  Warnings:

  - You are about to drop the column `tokenId` on the `PendingEvent` table. All the data in the column will be lost.
  - Added the required column `tokenId` to the `Tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PendingEvent" DROP COLUMN "tokenId";

-- AlterTable
ALTER TABLE "Tickets" ADD COLUMN     "tokenId" TEXT NOT NULL,
ALTER COLUMN "sold" SET DEFAULT false;
