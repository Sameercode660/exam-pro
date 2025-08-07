-- CreateTable
CREATE TABLE "WordCloudQuestion" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "title" TEXT,
    "words" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordCloudQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordCloudResponse" (
    "id" SERIAL NOT NULL,
    "participantId" INTEGER NOT NULL,
    "wordCloudId" INTEGER NOT NULL,
    "responseText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordCloudResponse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WordCloudQuestion" ADD CONSTRAINT "WordCloudQuestion_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCloudResponse" ADD CONSTRAINT "WordCloudResponse_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordCloudResponse" ADD CONSTRAINT "WordCloudResponse_wordCloudId_fkey" FOREIGN KEY ("wordCloudId") REFERENCES "WordCloudQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
