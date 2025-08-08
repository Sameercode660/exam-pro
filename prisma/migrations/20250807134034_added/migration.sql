-- CreateTable
CREATE TABLE "WordFrequency" (
    "id" SERIAL NOT NULL,
    "word" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "wordCloudId" INTEGER NOT NULL,

    CONSTRAINT "WordFrequency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordFrequency_word_wordCloudId_key" ON "WordFrequency"("word", "wordCloudId");

-- AddForeignKey
ALTER TABLE "WordFrequency" ADD CONSTRAINT "WordFrequency_wordCloudId_fkey" FOREIGN KEY ("wordCloudId") REFERENCES "WordCloudQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
