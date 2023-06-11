import * as admin from "firebase-admin"
import crypto from "crypto"

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
    this.tags.forEach(v => tags.push(v))

    return {
      source: this.source,
      sourceName: this.sourceName,
      url: this.url,
      subject: this.subject,
      content: this.content,
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
    return new Promise<any>(resolve => {
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

export class FirestoreArticleRepository implements ArticleRepository {
  db: admin.firestore.Firestore
  readonly COLLECTION_ARTICLE: string = "incident"

  constructor(firestore: admin.firestore.Firestore) {
    this.db = firestore
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
      await this.db
        .collection(this.COLLECTION_ARTICLE)
        .doc(article.toKey().getId())
        .update(data)
    } catch (err) {
      if ((err as Error).message.startsWith("5 NOT_FOUND")) {
        await this.db
          .collection(this.COLLECTION_ARTICLE)
          .doc(article.toKey().getId())
          .set(article.toData())
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  load(key: ArticleKey): Promise<IncidentArticle> {
    throw new Error("Method not implemented.")
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  findAll(source: string): Promise<IncidentArticle[]> {
    return this.db
      .collection(this.COLLECTION_ARTICLE)
      .listDocuments()
      .then(refs => {
        return Promise.all(refs.map(r => r.get()))
      })
      .then(snapshots => {
        return snapshots.map(s => {
          const d = s.data()
          if (d === undefined) {
            throw Error("document data is undefined.")
          }
          const article: IncidentArticle = new IncidentArticle(
            d.source,
            d.sourceName,
            d.url,
            d.subject,
            d.content,
            d.date,
            d.publishedDate,
            d.processedDate,
            d.author
          )
          if (d.category) {
            article.tags = new Set<string>(d.category)
          } else {
            article.tags = new Set<string>(d.tags)
          }
          if (s.id) {
            article.keyCreator = (): StaticKey => new StaticKey(s.id)
          }
          return article
        })
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
