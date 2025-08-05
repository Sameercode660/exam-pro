-- AddForeignKey
ALTER TABLE "StagingQuestion" ADD CONSTRAINT "StagingQuestion_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
