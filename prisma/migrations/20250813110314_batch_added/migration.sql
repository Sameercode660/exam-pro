-- AlterTable
ALTER TABLE "public"."Participant" ADD COLUMN     "batchId" INTEGER;

-- AlterTable
ALTER TABLE "public"."StagingParticipant" ADD COLUMN     "batchId" INTEGER;

-- CreateTable
CREATE TABLE "public"."UploadParticipantBatch" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadParticipantBatch_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Participant" ADD CONSTRAINT "Participant_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadParticipantBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UploadBatch" ADD CONSTRAINT "UploadBatch_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UploadParticipantBatch" ADD CONSTRAINT "UploadParticipantBatch_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."StagingParticipant" ADD CONSTRAINT "StagingParticipant_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "public"."UploadParticipantBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
