/*
  Warnings:

  - You are about to drop the column `userId` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `validFrom` on the `Group` table. All the data in the column will be lost.
  - You are about to drop the column `validTo` on the `Group` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Group` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Group` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Group" DROP CONSTRAINT "Group_userId_fkey";

-- AlterTable
ALTER TABLE "Group" DROP COLUMN "userId",
DROP COLUMN "validFrom",
DROP COLUMN "validTo",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdById" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "visibility" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "GroupParticipant" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "participantId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" INTEGER,

    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupParticipant_groupId_participantId_key" ON "GroupParticipant"("groupId", "participantId");

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
