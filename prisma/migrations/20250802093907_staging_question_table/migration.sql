-- CreateEnum
CREATE TYPE "StagingStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'DUPLICATE', 'IMPORTED');

-- CreateTable
CREATE TABLE "StagingQuestion" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "categoryName" TEXT,
    "topicName" TEXT,
    "question" TEXT,
    "option1" TEXT,
    "option2" TEXT,
    "option3" TEXT,
    "option4" TEXT,
    "correctOption" INTEGER,
    "difficultyLevel" TEXT,
    "status" "StagingStatus" NOT NULL DEFAULT 'PENDING',
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagingQuestion_pkey" PRIMARY KEY ("id")
);
