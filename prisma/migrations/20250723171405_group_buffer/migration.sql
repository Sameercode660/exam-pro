-- CreateTable
CREATE TABLE "ScheduledGroupBuffer" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ScheduledGroupBuffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTacking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "loginTime" TIMESTAMP(3) NOT NULL,
    "logoutTime" TIMESTAMP(3) NOT NULL,
    "spentTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTacking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledGroupBuffer_groupId_key" ON "ScheduledGroupBuffer"("groupId");

-- AddForeignKey
ALTER TABLE "ScheduledGroupBuffer" ADD CONSTRAINT "ScheduledGroupBuffer_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTacking" ADD CONSTRAINT "UserTacking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
