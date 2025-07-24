/*
  Warnings:

  - You are about to drop the `UserTacking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserTacking" DROP CONSTRAINT "UserTacking_userId_fkey";

-- DropTable
DROP TABLE "UserTacking";

-- CreateTable
CREATE TABLE "ParticipantTracking" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL,
    "logoutTime" TIMESTAMP(3) NOT NULL,
    "spentTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ParticipantTracking_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ParticipantTracking" ADD CONSTRAINT "ParticipantTracking_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
