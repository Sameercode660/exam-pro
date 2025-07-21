/*
  Warnings:

  - A unique constraint covering the columns `[userId,examId]` on the table `Result` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Result_userId_examId_key" ON "Result"("userId", "examId");

-- AddForeignKey
ALTER TABLE "ScheduledExamBuffer" ADD CONSTRAINT "ScheduledExamBuffer_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
