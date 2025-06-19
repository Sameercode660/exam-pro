-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "visibility" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "IntResponse" (
    "id" SERIAL NOT NULL,
    "examId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "IntResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IntResponse" ADD CONSTRAINT "IntResponse_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntResponse" ADD CONSTRAINT "IntResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntResponse" ADD CONSTRAINT "IntResponse_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
