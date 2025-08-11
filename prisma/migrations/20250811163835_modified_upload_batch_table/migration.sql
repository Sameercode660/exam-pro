/*
  Warnings:

  - You are about to drop the column `uploadBatchId` on the `StagingQuestion` table. All the data in the column will be lost.
  - You are about to drop the column `batchId` on the `UploadBatch` table. All the data in the column will be lost.
  - Changed the type of `batchId` on the `StagingQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."StagingQuestion" DROP CONSTRAINT "StagingQuestion_batchId_fkey";

-- DropForeignKey
ALTER TABLE "public"."StagingQuestion" DROP CONSTRAINT "StagingQuestion_uploadBatchId_fkey";

-- DropIndex
DROP INDEX "public"."UploadBatch_batchId_key";

-- AlterTable
ALTER TABLE "public"."StagingQuestion" DROP COLUMN "uploadBatchId",
DROP COLUMN "batchId",
ADD COLUMN     "batchId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "public"."UploadBatch" DROP COLUMN "batchId";

-- CreateIndex
CREATE INDEX "StagingQuestion_batchId_idx" ON "public"."StagingQuestion"("batchId");

-- AddForeignKey
ALTER TABLE "public"."StagingQuestion" ADD CONSTRAINT "StagingQuestion_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadBatch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
