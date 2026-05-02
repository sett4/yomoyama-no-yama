import assert from "assert/strict"
import fs from "fs"
import os from "os"
import path from "path"
import {
  applyMigrations,
  createDbClient,
  ensureCategory,
  findPostExtraById,
  POST_EXTRA_TYPE,
  upsertPostExtra,
} from "@sett4/yomo-yama-db"
import { DbArticleRepository, IncidentArticle } from "./index"

function createArticle(params: {
  source?: string
  url: string
  subject: string
  content: string
  publishedDate: string
}) {
  const article = new IncidentArticle(
    params.source || "yj-news",
    params.source || "yj-news",
    params.url,
    params.subject,
    params.content,
    params.content,
    params.publishedDate,
    params.publishedDate,
    new Date(params.publishedDate),
    ""
  )
  article.tags.add("山岳事故")
  article.tags.add("長野県")
  article.scraper = params.source || "yj-news"
  return article
}

describe("db-backed incident repository", () => {
  let client: ReturnType<typeof createDbClient>["client"]
  let repository: DbArticleRepository
  let dbFilePath: string

  beforeEach(async () => {
    dbFilePath = path.join(
      os.tmpdir(),
      `yomo-yama-test-${Date.now()}-${Math.random()}.db`
    )
    const setup = createDbClient(`file:${dbFilePath}`)
    client = setup.client
    await applyMigrations(client)
    repository = new DbArticleRepository(setup.db)
  })

  afterEach(() => {
    client.close()
    if (fs.existsSync(dbFilePath)) {
      fs.rmSync(dbFilePath, { force: true })
    }
  })

  test("category incident is created on first save", async () => {
    await repository.save(
      createArticle({
        url: "https://example.com/a",
        subject: "article-a",
        content: "content-a",
        publishedDate: "2026-03-20T00:00:00.000Z",
      })
    )

    const category = await ensureCategory((repository as any).db, "incident")
    assert.equal(category.name, "incident")
    assert.equal(typeof category.id, "string")
    assert.ok(category.id.length > 0)
  })

  test("save performs upsert and findAll keeps descending order", async () => {
    const newer = createArticle({
      url: "https://example.com/same",
      subject: "before-update",
      content: "before-content",
      publishedDate: "2026-03-21T00:00:00.000Z",
    })
    await repository.save(newer)

    const updated = createArticle({
      url: "https://example.com/same",
      subject: "after-update",
      content: "after-content",
      publishedDate: "2026-03-21T00:00:00.000Z",
    })
    updated.tags.add("北アルプス")
    await repository.save(updated)

    const older = createArticle({
      url: "https://example.com/older",
      subject: "older",
      content: "older-content",
      publishedDate: "2026-03-19T00:00:00.000Z",
    })
    await repository.save(older)

    const all = await repository.findAll("yj-news")
    assert.equal(all.length, 2)
    assert.equal(all[0].subject, "after-update")
    assert.equal(all[0].content, "after-content")
    assert.equal(
      new Date(all[0].publishedDate).toISOString(),
      "2026-03-21T00:00:00.000Z"
    )
    assert.ok(all[0].tags.has("山岳事故"))
    assert.ok(all[0].tags.has("北アルプス"))
    assert.equal(all[1].subject, "older")

    const rows = await client.execute({
      sql: 'SELECT "id", "createdAt", "updatedAt", "publishedAt" FROM "Post" WHERE "slug" = ?',
      args: [updated.toKey().getId()],
    })
    const row = rows.rows[0] as Record<string, unknown>
    assert.equal(typeof row.id, "string")
    assert.ok((row.id as string).length > 0)
    assert.equal(typeof row.createdAt, "number")
    assert.equal(typeof row.updatedAt, "number")
    assert.equal(typeof row.publishedAt, "number")
    assert.ok((row.createdAt as number) < 10_000_000_000)
    assert.ok((row.updatedAt as number) < 10_000_000_000)
    assert.ok((row.publishedAt as number) < 10_000_000_000)

    const initialId = row.id
    await repository.save(updated)
    const afterRows = await client.execute({
      sql: 'SELECT "id" FROM "Post" WHERE "slug" = ?',
      args: [updated.toKey().getId()],
    })
    const afterRow = afterRows.rows[0] as Record<string, unknown>
    assert.equal(afterRow.id, initialId)
  })

  test("postExtra can be fetched and upserted", async () => {
    await upsertPostExtra((repository as any).db, {
      id: "post-1",
      type: POST_EXTRA_TYPE.INCIDENT_GPT,
      content: '{"summary":"first"}',
    })
    await upsertPostExtra((repository as any).db, {
      id: "post-1",
      type: POST_EXTRA_TYPE.INCIDENT_GPT,
      content: '{"summary":"second"}',
    })

    const postExtra = await findPostExtraById((repository as any).db, "post-1")
    assert.equal(postExtra?.type, POST_EXTRA_TYPE.INCIDENT_GPT)
    assert.equal(postExtra?.content, '{"summary":"second"}')
  })

  test("applyMigrations normalizes legacy millisecond timestamps", async () => {
    await client.execute(
      `INSERT INTO "Category" ("id", "name") VALUES ('incident-id', 'incident')`
    )
    await client.execute({
      sql: `INSERT INTO "Post" (
        "id", "createdAt", "updatedAt", "publishedAt", "title", "content",
        "contentType", "categoryId", "rawContent", "published", "author",
        "source", "sourceUrl", "slug", "scraper", "tags"
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        "legacy-post",
        1776529003969,
        1776529003969,
        1776470400000,
        "legacy",
        "legacy-content",
        "incident",
        "incident-id",
        null,
        1,
        "",
        "yj-news",
        "https://example.com/legacy",
        "legacy-slug",
        "yj-news",
        "山岳事故",
      ],
    })

    await applyMigrations(client)

    const rows = await client.execute(
      `SELECT "createdAt", "updatedAt", "publishedAt" FROM "Post" WHERE "id" = 'legacy-post'`
    )
    const row = rows.rows[0] as Record<string, unknown>
    assert.equal(row.createdAt, 1776529003)
    assert.equal(row.updatedAt, 1776529003)
    assert.equal(row.publishedAt, 1776470400)
  })
})
