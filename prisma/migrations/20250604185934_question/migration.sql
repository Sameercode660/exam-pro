/*
  Warnings:

  - Added the required column `topicId` to the `Question` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Option" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "topicId" TEXT NOT NULL,
ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Response" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Result" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "Topic" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0');

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
