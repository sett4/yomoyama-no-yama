import { sql } from "drizzle-orm"
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core"

export const POST_EXTRA_TYPE = {
  INCIDENT_GPT: "INCIDENT_GPT",
} as const

export type PostExtraType =
  (typeof POST_EXTRA_TYPE)[keyof typeof POST_EXTRA_TYPE]

export const categories = sqliteTable(
  "Category",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
  },
  (table) => ({
    nameKey: uniqueIndex("Category_name_key").on(table.name),
  })
)

export const posts = sqliteTable(
  "Post",
  {
    id: text("id").primaryKey(),
    createdAt: integer("createdAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updatedAt", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    publishedAt: integer("publishedAt", { mode: "timestamp" }).notNull(),
    title: text("title").notNull(),
    content: text("content"),
    contentType: text("contentType").notNull(),
    categoryId: text("categoryId")
      .notNull()
      .references(() => categories.id),
    rawContent: text("rawContent"),
    published: integer("published", { mode: "boolean" })
      .notNull()
      .default(false),
    author: text("author").notNull(),
    source: text("source").notNull(),
    sourceUrl: text("sourceUrl").notNull(),
    slug: text("slug").notNull(),
    scraper: text("scraper").notNull(),
    tags: text("tags").notNull(),
  },
  (table) => ({
    postKey: uniqueIndex("Post_categoryId_slug_key").on(
      table.categoryId,
      table.slug
    ),
    publishedAtIdx: index("Post_publishedAt_idx").on(
      table.publishedAt,
      table.categoryId,
      table.published
    ),
  })
)

export const postExtras = sqliteTable("PostExtra", {
  id: text("id").primaryKey(),
  type: text("type", {
    enum: [POST_EXTRA_TYPE.INCIDENT_GPT],
  }).notNull(),
  content: text("content"),
})
