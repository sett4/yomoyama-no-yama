import { Logger } from "@google-cloud/logging-bunyan/build/src/middleware/express"
import { Express } from "express"
import {
  ArticleRepository,
  FirestoreArticleRepository,
  IncidentArticle,
  IndexScraper,
} from "../datasource/incident"
import Np24Scraper from "../datasource/incident/np24"
import { ArticleScrapers } from "../datasource/incident/scraper"
import YahooIndexScraper from "../datasource/incident/yahoo"
import { log } from "../logger"

const registerHandler = function(
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  const repository: ArticleRepository = new FirestoreArticleRepository(
    firestore
  )

  async function update(
    repository: ArticleRepository,
    indexScraper: IndexScraper
  ): Promise<void> {
    log.info(`updateing ${indexScraper.constructor.name}`)
    const articleScrapers = new ArticleScrapers()
    const articleUrls = await indexScraper.getArticleUrls()

    const allArticle: IncidentArticle[] = []
    for (const url of articleUrls) {
      const articles = await articleScrapers.scrape(url)
      allArticle.push(...articles)
    }
    log.info(`extract ${allArticle.length} articles.`)

    if (allArticle.length == 0) {
      log.error(`article extraction result is 0. something went wrong?`)
    }

    await Promise.all(
      allArticle.map(async article => {
        log.info(`saving article ${article.url} ${article.toKey().getId()}`)
        return await repository.save(article)
      })
    )
  }

  app.get("/", (req, res) => {
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
    await update(repository, indexScraper)
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
    req.log.info("updateing yahoo")
    const indexScraper = new YahooIndexScraper()
    await update(repository, indexScraper)
    res.send("OK")
  })

  app.get("/datasource/mountain/incident/modify", async (req, res) => {
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

  app.get("/datasource/mountain/incident/hide", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)

    const hiddenKeys: Array<String> = [
      "yj-news.e82b261f694b342b01e7934cfb642294c35334730b26fc6c9a80ee62d74137a2",
      "yj-news.c46a3d58e0cd574533b9acad0589ed80bea09a7d80bc04b49d2bc1c669467afd",
      "yj-news.4bcb43bf0d299931f76eb81527da1cd29c426153cf0f54b43d78c800fcdfd66f",
      "yj-news.f047011becbc1c81f49b49da9021691fa5ed256392f80ce8c126a9b4067fad4e",
      "yj-news.e50eecd9e545d3112e0a3dfef7d4d5be4df0b78f1fe54dfbb695066ef1979cdb",
    ]
    const modifiedArticles = articles
      .filter(a => a.tags.has("山岳事故") && !a.tags.has("hidden"))
      .filter(a => hiddenKeys.includes(a.toKey().getId()))
      // .filter(a => idList.includes(a.toKey().getId()))
      .map(a => {
        a.tags.add("hidden")
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
