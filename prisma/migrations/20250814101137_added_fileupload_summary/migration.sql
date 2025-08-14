-- CreateEnum
CREATE TYPE "public"."UploadType" AS ENUM ('QUESTION_FILE', 'PARTICIPANT_FILE', 'PARTICIPANT_GROUP_ADD');

-- CreateTable
CREATE TABLE "public"."FileUploadSummary" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER,
    "adminId" INTEGER NOT NULL,
    "type" "public"."UploadType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "inserted" INTEGER NOT NULL,
    "skipped" INTEGER NOT NULL,
    "failed" INTEGER NOT NULL,
    "summaryData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FileUploadSummary_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."FileUploadSummary" ADD CONSTRAINT "FileUploadSummary_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileUploadSummary" ADD CONSTRAINT "FileUploadSummary_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
