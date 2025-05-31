/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Exam` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Exam` table. All the data in the column will be lost.
  - Added the required column `createdByAdminId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedByAdminId` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_createdBy_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "createdBy",
DROP COLUMN "updatedBy",
ADD COLUMN     "createdByAdminId" TEXT NOT NULL,
ADD COLUMN     "updatedByAdminId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
