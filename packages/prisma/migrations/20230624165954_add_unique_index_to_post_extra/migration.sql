/*
  Warnings:

  - A unique constraint covering the columns `[postId]` on the table `PostExtra` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PostExtra_postId_key" ON "PostExtra"("postId");
