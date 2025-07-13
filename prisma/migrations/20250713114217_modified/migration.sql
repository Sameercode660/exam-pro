/*
  Warnings:

  - Added the required column `organizationId` to the `Participant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "visibility" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
