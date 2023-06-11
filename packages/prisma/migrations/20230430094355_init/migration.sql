-- CreateTable
CREATE TABLE "Incident" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "title" STRING NOT NULL,
    "content" STRING,
    "rawContent" STRING,
    "published" BOOL NOT NULL DEFAULT false,
    "author" STRING NOT NULL,
    "source" STRING NOT NULL,
    "scraper" STRING NOT NULL,

    CONSTRAINT "Incident_pkey" PRIMARY KEY ("id")
);
