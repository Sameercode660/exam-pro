-- CreateEnum
CREATE TYPE "ParticipantStagingStatus" AS ENUM ('PENDING', 'VALID', 'INVALID', 'DUPLICATE', 'IMPORTED');

-- CreateTable
CREATE TABLE "StagingParticipant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "organizationId" INTEGER NOT NULL,
    "createdById" INTEGER NOT NULL,
    "status" "StagingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StagingParticipant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StagingParticipant" ADD CONSTRAINT "StagingParticipant_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
