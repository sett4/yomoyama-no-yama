-- CreateTable
CREATE TABLE "PostExtra" (
    "id" STRING NOT NULL,
    "postId" STRING NOT NULL,
    "type" "PostExtraType" NOT NULL,
    "content" STRING,

    CONSTRAINT "PostExtra_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PostExtra" ADD CONSTRAINT "PostExtra_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
