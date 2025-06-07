-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'VERY_HARD', 'TRICKY');

-- CreateTable
CREATE TABLE "User" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "mobileNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "name" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "text" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "useFreq" INTEGER NOT NULL DEFAULT 0,
    "rightFreq" INTEGER NOT NULL DEFAULT 0,
    "wrongFreq" INTEGER NOT NULL DEFAULT 0,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'MEDIUM',
    "correctOption" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "adminId" TEXT,
    "examId" CHAR(8),

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "text" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exam" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdByAdminId" TEXT NOT NULL,
    "updatedByAdminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedOption" INTEGER NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Result" (
    "id" CHAR(8) NOT NULL DEFAULT LPAD((FLOOR(RANDOM() * 100000000))::TEXT, 8, '0'),
    "userId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_mobileNumber_key" ON "User"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_mobileNumber_key" ON "Admin"("mobileNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_examCode_key" ON "Exam"("examCode");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_createdByAdminId_fkey" FOREIGN KEY ("createdByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_updatedByAdminId_fkey" FOREIGN KEY ("updatedByAdminId") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Result" ADD CONSTRAINT "Result_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
