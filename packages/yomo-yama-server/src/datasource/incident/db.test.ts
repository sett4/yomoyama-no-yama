import assert from "power-assert"
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
    assert.ok(all[0].tags.has("山岳事故"))
    assert.ok(all[0].tags.has("北アルプス"))
    assert.equal(all[1].subject, "older")
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
})
