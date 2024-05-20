-- CreateTable
CREATE TABLE "AdEvent" (
    "id" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "AdEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdEvent" ADD CONSTRAINT "AdEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
