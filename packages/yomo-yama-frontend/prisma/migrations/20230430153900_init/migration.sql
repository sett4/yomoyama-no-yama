/*
  Warnings:

  - You are about to drop the `Incident` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Incident";

-- CreateTable
CREATE TABLE "Post" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "title" STRING NOT NULL,
    "content" STRING,
    "contentType" STRING NOT NULL,
    "categoryId" STRING NOT NULL,
    "rawContent" STRING,
    "published" BOOL NOT NULL DEFAULT false,
    "author" STRING NOT NULL,
    "source" STRING NOT NULL,
    "sourceUrl" STRING NOT NULL,
    "slug" STRING NOT NULL,
    "scraper" STRING NOT NULL,
    "tags" STRING NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
