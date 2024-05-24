/*
  Warnings:

  - You are about to drop the column `mnemonic` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mnemonicIsShown` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `privateKey` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[bcAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `Tickets` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketCategoryId` to the `Tickets` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tickets" ADD COLUMN     "eventId" TEXT NOT NULL,
ADD COLUMN     "ticketCategoryId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "mnemonic",
DROP COLUMN "mnemonicIsShown",
DROP COLUMN "privateKey";

-- CreateTable
CREATE TABLE "BlockchainInfo" (
    "id" TEXT NOT NULL,
    "privateKey" TEXT,
    "mnemonic" TEXT,
    "mnemonicIsShown" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,

    CONSTRAINT "BlockchainInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketCategory" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainInfo_userId_key" ON "BlockchainInfo"("userId");

-- CreateIndex
CREATE INDEX "TicketCategory_eventId_idx" ON "TicketCategory"("eventId");

-- CreateIndex
CREATE INDEX "Tickets_userId_idx" ON "Tickets"("userId");

-- CreateIndex
CREATE INDEX "Tickets_eventId_idx" ON "Tickets"("eventId");

-- CreateIndex
CREATE INDEX "Tickets_ticketCategoryId_idx" ON "Tickets"("ticketCategoryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_bcAddress_key" ON "User"("bcAddress");

-- AddForeignKey
ALTER TABLE "BlockchainInfo" ADD CONSTRAINT "BlockchainInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tickets" ADD CONSTRAINT "Tickets_ticketCategoryId_fkey" FOREIGN KEY ("ticketCategoryId") REFERENCES "TicketCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketCategory" ADD CONSTRAINT "TicketCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
