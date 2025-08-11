-- DropForeignKey
ALTER TABLE "public"."StagingQuestion" DROP CONSTRAINT "StagingQuestion_batchId_fkey";

-- AlterTable
ALTER TABLE "public"."StagingQuestion" ALTER COLUMN "batchId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."StagingQuestion" ADD CONSTRAINT "StagingQuestion_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
