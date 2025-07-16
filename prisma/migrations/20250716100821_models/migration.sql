-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "startTime" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "GroupExam" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "examId" INTEGER NOT NULL,
    "assignedBy" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupExam_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GroupExam_groupId_examId_key" ON "GroupExam"("groupId", "examId");

-- AddForeignKey
ALTER TABLE "GroupExam" ADD CONSTRAINT "GroupExam_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupExam" ADD CONSTRAINT "GroupExam_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupExam" ADD CONSTRAINT "GroupExam_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
