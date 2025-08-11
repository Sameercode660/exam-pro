/*
  Warnings:

  - Added the required column `batchId` to the `StagingQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."StagingQuestion" ADD COLUMN     "batchId" TEXT NOT NULL,
ADD COLUMN     "uploadBatchId" INTEGER;

-- CreateTable
CREATE TABLE "public"."UploadBatch" (
    "id" SERIAL NOT NULL,
    "batchId" TEXT NOT NULL,
    "adminId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadBatch_batchId_key" ON "public"."UploadBatch"("batchId");

-- CreateIndex
CREATE INDEX "StagingQuestion_batchId_idx" ON "public"."StagingQuestion"("batchId");

-- AddForeignKey
ALTER TABLE "public"."StagingQuestion" ADD CONSTRAINT "StagingQuestion_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadBatch"("batchId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StagingQuestion" ADD CONSTRAINT "StagingQuestion_uploadBatchId_fkey" FOREIGN KEY ("uploadBatchId") REFERENCES "public"."UploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
