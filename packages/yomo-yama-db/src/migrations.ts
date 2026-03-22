import type { Client } from "@libsql/client"

export const migrationStatements = [
  `CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_key" ON "Category"("name")`,
  `CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "createdAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    "updatedAt" INTEGER NOT NULL DEFAULT (unixepoch() * 1000),
    "publishedAt" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "contentType" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "rawContent" TEXT,
    "published" INTEGER NOT NULL DEFAULT 0,
    "author" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "scraper" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "Post_categoryId_slug_key" ON "Post"("categoryId", "slug")`,
  `CREATE INDEX IF NOT EXISTS "Post_publishedAt_idx" ON "Post"("publishedAt", "categoryId", "published")`,
  `CREATE TABLE IF NOT EXISTS "PostExtra" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT
  )`,
]

export async function applyMigrations(client: Client) {
  for (const sql of migrationStatements) {
    await client.execute(sql)
  }
}
