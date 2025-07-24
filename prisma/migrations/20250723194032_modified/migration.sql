/*
  Warnings:

  - Changed the type of `spentTime` on the `ParticipantTracking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "ParticipantTracking" DROP COLUMN "spentTime",
ADD COLUMN     "spentTime" INTEGER NOT NULL;
