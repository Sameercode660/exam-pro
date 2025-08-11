-- AlterTable
ALTER TABLE "public"."Question" ADD COLUMN     "batchId" INTEGER;

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
