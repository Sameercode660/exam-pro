-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
