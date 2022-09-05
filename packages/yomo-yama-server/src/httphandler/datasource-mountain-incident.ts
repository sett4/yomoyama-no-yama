import { Express } from "express"
import {
  ArticleRepository,
  FirestoreArticleRepository,
  IncidentArticle,
  IndexScraper,
} from "../datasource/incident"
import Np24Scraper from "../datasource/incident/np24"
import { AddMountainTagProcessor } from "../datasource/incident/postprocessor"
import { ArticleScrapers } from "../datasource/incident/scraper"
import YahooIndexScraper from "../datasource/incident/yahoo"
import { getLogger } from "../logger"

const registerHandler = async function(
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  const repository: ArticleRepository = new FirestoreArticleRepository(
    firestore
  )
  const articleScrapers: ArticleScrapers = new ArticleScrapers()
  const addMountainTagProcessor = new AddMountainTagProcessor()
  await addMountainTagProcessor.initialize()
  articleScrapers.registerPostProcessor(addMountainTagProcessor)

  async function update(
    repository: ArticleRepository,
    indexScraper: IndexScraper,
    articleScraper: ArticleScrapers
  ): Promise<void> {
    getLogger().info(`updateing ${indexScraper.constructor.name}`)
    const articleUrls = await indexScraper.getArticleUrls()

    const allArticle: IncidentArticle[] = []
    for (const url of articleUrls) {
      const articles = await articleScrapers.scrape(url)
      allArticle.push(...articles)
    }
    getLogger().info(`extract ${allArticle.length} articles.`)

    if (allArticle.length == 0) {
      getLogger().error(`article extraction result is 0. something went wrong?`)
    }

    await Promise.all(
      allArticle.map(async article => {
        getLogger().info(
          `saving article ${article.url} ${article.toKey().getId()}`
        )
        return await repository.save(article)
      })
    )
  }

  app.get("/", (req, res) => {
    getLogger().info("hello from out from req")
    res.send("🎉 Hello TypeScript! 🎉")
  })

  app.get("/datasource/mountain/incident/np24/update", async (req, res) => {
    if (process.env.NODE_ENV !== "development") {
      if (req.header("X-Appengine-Cron") !== "true") {
        res.send("NG")
        res.status(401)
        return
      }
    }
    req.log.info("updateing np24")
    const indexScraper = new Np24Scraper()
    await update(repository, indexScraper, articleScrapers)
    res.send("OK")
  })

  app.get("/datasource/mountain/incident/yahoo/update", async (req, res) => {
    if (process.env.NODE_ENV !== "development") {
      if (req.header("X-Appengine-Cron") !== "true") {
        res.send("NG")
        res.status(401)
        return
      }
    }
    getLogger().info("updateing yahoo")
    const indexScraper = new YahooIndexScraper()
    await update(repository, indexScraper, articleScrapers)
    res.send("OK")
  })

  app.post("/datasource/mountain/incident/modify", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)
    const modifiedArticles = articles
      .filter(a => a.tags.has("山岳事故"))
      .filter(a => {
        if (
          // (a.content + a.subject).match(/遭難/)
          a.content.match(
            /(指名式|追悼|指定式|発隊式|開始式|祈願|訓練を|開設|会議|ワニ|政府|地震|ヨット|訓示|注意点|約束|観光|感謝状|思いやり|急増している|命名|激撮|設置|リニア|報告|出発式|社会貢献|閉所式|気がかり|結隊式|祈り|祈る|献花|追悼式|開幕|冥福|授業|遺族|慰霊)/
          ) ||
          a.subject.match(
            /(指名式|追悼|指定式|発隊式|開始式|祈願|訓練を|開設|会議|ワニ|政府|地震|ヨット|訓示|注意点|約束|観光|感謝状|思いやり|急増している|命名|激撮|設置|リニア|報告|出発式|社会貢献|閉所式|気がかり|結隊式|祈り|祈る|献花|追悼式|開幕|冥福|授業|遺族|慰霊)/
          )
        ) {
          return true
        } else {
          return false
        }
      })
      // .filter(a => idList.includes(a.toKey().getId()))
      .map(a => {
        a.tags.delete("山岳事故")
        req.log.info("deleted 山岳事故 ", a.toKey().getId(), a.subject, a.url)
        return a
      })

    await Promise.all(
      modifiedArticles.map(article => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map(e => e.toData()))
  })

  app.post("/datasource/mountain/incident/remove-tag", async (req, res) => {
    req.log.info("updateing...")
    const tagToRemove = "里山"
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)
    const modifiedArticles = articles
      .filter(a => a.tags.has("山岳事故"))
      .filter(a => a.tags.has(tagToRemove))
      // .filter(a => idList.includes(a.toKey().getId()))
      .map(a => {
        a.tags.delete(tagToRemove)
        req.log.info(
          `deleted ${tagToRemove}`,
          a.toKey().getId(),
          a.subject,
          a.url
        )
        return a
      })

    await Promise.all(
      modifiedArticles.map(article => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map(e => e.toData()))
  })

  app.post("/datasource/mountain/incident/extract-tags", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("nhk-l")
    req.log.info(`loaded ${articles.length} articles`)
    const filteredArticles = articles.filter(a => a.tags.has("山岳事故"))

    const modifiedArticles: IncidentArticle[] = []
    for (const a of filteredArticles) {
      req.log.info(`extracting tags`, a.toKey().getId(), a.subject, a.url)
      modifiedArticles.push(await addMountainTagProcessor.postProcess(a))
    }

    await Promise.all(
      modifiedArticles.map(article => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map(e => e.toData()))
  })

  app.post("/datasource/mountain/incident/hide", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)

    const hiddenKeys: Array<String> = [
      "yj-news.9257335971e2501ef72b4578264382142721a6cbbc140ff76ada0e5237fca18b",
    ]
    const modifiedArticles = articles
      .filter(a => a.tags.has("山岳事故") && !a.tags.has("__hidden"))
      .filter(a => hiddenKeys.includes(a.toKey().getId()))
      // .filter(a => idList.includes(a.toKey().getId()))
      .map(a => {
        a.tags.add("__hidden")
        req.log.info("add hidden ", a.toKey().getId(), a.subject, a.url)
        return a
      })

    await Promise.all(
      modifiedArticles.map(article => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map(e => e.toData()))
  })

  app.get("/datasource/mountain/incident/yahoo/show", async (req, res) => {
    const indexScraper = new YahooIndexScraper()
    const articleUrls = await indexScraper.getArticleUrls()

    const articleScrapers = new ArticleScrapers()
    const allArticle: IncidentArticle[] = []
    for (const url of articleUrls) {
      const articles = await articleScrapers.scrape(url)
      allArticle.push(...articles)
    }
    req.log.info(`extract ${allArticle.length} articles.`)

    const allArticleData = allArticle.map(a => a.toData())

    res.send(allArticleData)
  })
}

export { registerHandler }
