import crypto from "crypto"
import {
  type DbClient,
  ensureCategory,
  findPublishedPostsByCategoryAndSource,
  upsertPost,
} from "@sett4/yomo-yama-db"

export interface ArticleRepository {
  exists(key: ArticleKey): boolean
  save(article: IncidentArticle): Promise<any>
  load(key: ArticleKey): Promise<IncidentArticle>
  findAll(source: string): Promise<IncidentArticle[]>
}

class StaticKey implements ArticleKey {
  id: string
  constructor(id: string) {
    this.id = id
  }

  getId(): string {
    return this.id
  }
}

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + "..."
}

export class SingleArticleKey {
  source: string
  url: string
  constructor(source: string, url: string) {
    this.source = source
    this.url = url
  }

  getId(): string {
    const hash = crypto.createHash("sha256")
    hash.update(this.source)
    hash.update(this.url)
    return this.source + "." + hash.digest("hex")
  }
}

export class IncidentArticle {
  source: string
  url: string
  subject: string
  content: string
  rawContent: string
  publishedDate: string
  processedDate: Date
  tags: Set<string> = new Set<string>()
  date: string
  sourceName: string
  author: string
  public scraper = ""
  public keyCreator: ArticleKeyCreator

  constructor(
    source: string,
    sourceName: string,
    url: string,
    subject: string,
    content: string,
    rawContent: string,
    date: string,
    publishedDate: string,
    processedDate: Date,
    author: string
  ) {
    this.source = source
    this.sourceName = sourceName
    this.url = url
    this.subject = subject
    this.content = content
    this.rawContent = rawContent
    this.publishedDate = publishedDate
    this.processedDate = processedDate
    this.date = date
    this.author = author
    this.keyCreator = (a): SingleArticleKey =>
      new SingleArticleKey(a.source, a.url)
  }

  toKey(): ArticleKey {
    return this.keyCreator(this)
  }

  toData(): any {
    const tags: string[] = []
    this.tags.forEach((v) => tags.push(v))

    return {
      source: this.source,
      sourceName: this.sourceName,
      url: this.url,
      subject: this.subject,
      content: this.content,
      rawContent: this.rawContent,
      date: this.date,
      publishedDate: this.publishedDate,
      processedDate: this.processedDate,
      tags: tags,
      scraper: this.scraper,
      author: this.author || "",
    }
  }
}

export class EmptyArticleRepository implements ArticleRepository {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exists(key: ArticleKey): boolean {
    throw new Error("Method not implemented.")
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  save(article: any): Promise<any> {
    return new Promise<any>((resolve) => {
      resolve(article)
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(key: ArticleKey): Promise<IncidentArticle> {
    throw new Error("Method not implemented.")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(source: string): Promise<IncidentArticle[]> {
    throw new Error("Method not implemented.")
  }
}

export class DbArticleRepository implements ArticleRepository {
  db: DbClient
  readonly COLLECTION_ARTICLE: string = "incident"

  constructor(db: DbClient) {
    this.db = db
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  exists(key: ArticleKey): boolean {
    throw new Error("Method not implemented.")
  }

  async save(article: IncidentArticle): Promise<any> {
    const data = article.toData()
    if (data.tags && data.tags.length > 0) {
      // data.tags = admin.firestore.FieldValue.arrayUnion(...data.tags)
    } else {
      delete data.tags
    }

    try {
      const category = await ensureCategory(this.db, "incident")
      const published =
        article.tags.has("山岳事故") && !article.tags.has("hidden")
      await upsertPost(this.db, {
        publishedAt: new Date(article.publishedDate),
        title: article.subject,
        content: article.content,
        contentType: "incident",
        categoryId: category.id,
        rawContent: article.rawContent,
        published: published,
        author: "",
        source: article.source,
        sourceUrl: article.url,
        slug: article.toKey().getId(),
        scraper: article.scraper,
        tags: [...article.tags].join(","),
      })
    } catch (err) {
      throw err
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(key: ArticleKey): Promise<IncidentArticle> {
    throw new Error("Method not implemented.")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async findAll(source: string): Promise<IncidentArticle[]> {
    const incidentPosts = await findPublishedPostsByCategoryAndSource(
      this.db,
      "incident",
      source
    )
    return incidentPosts.map((p) => {
      const article: IncidentArticle = new IncidentArticle(
        p.source,
        p.source,
        p.sourceUrl,
        p.title,
        p.content || "",
        p.rawContent || "",
        p.publishedAt.toISOString(),
        p.publishedAt.toISOString(),
        p.publishedAt,
        p.author
      )
      article.tags = new Set<string>(p.tags.split(",").filter(Boolean))
      return article
    })
  }
}

export interface IndexScraper {
  getArticleUrls(): Promise<string[]>
}

export interface ArticleKey {
  getId(): string
}

export type ArticleKeyCreator = (a: IncidentArticle) => ArticleKey
export class MultipleArticleKey {
  source: string
  url: string
  subject: string
  constructor(source: string, url: string, subject: string) {
    this.source = source
    this.url = url
    this.subject = subject
  }

  getId(): string {
    const hash = crypto.createHash("sha256")
    hash.update(this.source)
    hash.update(this.url)
    hash.update(this.subject)
    return this.source + "." + hash.digest("hex")
  }
}
