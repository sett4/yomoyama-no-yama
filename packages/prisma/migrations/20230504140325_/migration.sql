/*
  Warnings:

  - A unique constraint covering the columns `[categoryId,slug]` on the table `Post` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Post_categoryId_slug_key" ON "Post"("categoryId", "slug");
