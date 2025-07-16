/*
  Warnings:

  - A unique constraint covering the columns `[name,adminId]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,categoryId,adminId]` on the table `Topic` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Category_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_adminId_key" ON "Category"("name", "adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_name_categoryId_adminId_key" ON "Topic"("name", "categoryId", "adminId");
