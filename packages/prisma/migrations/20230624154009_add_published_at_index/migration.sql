-- CreateIndex
CREATE INDEX "Post_publishedAt_idx" ON "Post"("publishedAt" DESC, "categoryId", "published");
