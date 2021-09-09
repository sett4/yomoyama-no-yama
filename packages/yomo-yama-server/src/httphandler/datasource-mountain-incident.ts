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
      "yj-news.9257335971e2501ef72b4578264382142721a6cbbc140ff76ada0e5237fca18b",
      "yj-news.3f5c1b3e4a3f3da5dbbbe2eec4413534ddcd26c0a5126170d29a6ad9e38b6f91",
      "yj-news.b8b0d22d48e7c91098128618227c60abce0d21bcfc617293b8e678f62081195e",
      "yj-news.c981dc466b39a45679d57e9b16e04ae81a260a3318ccf0887ede415aafd3fac2",
      "yj-news.e1b4ad9155a60297697e2ad27234481313d736f2de30f4acc05158634446cb73",
      "yj-news.23e4afba0065e700e926104f2eb68767302c418542f4dcc7d0e91eece97cc240",
      "yj-news.186ae998e0fbb5579032abf97abae620c81f64b8b800b3a38b00cdfe3b9bb463",
      "yj-news.984a2c01d9450ae2e25fef3051d2750a8df6228dbcebad8b1ded38c4ece3bb53",
      "yj-news.9072b32d4febbd41895d1b430e9dcf34d50468d85912e13305d185636f69efc1",
      "yj-news.76227467d17471033d43d84c869dbeb37840e80d440cff3500d5d919cd7fed09",
      "yj-news.ef9c21fa0fde090e20eae081640c3c3e48b6a2498dc4e21a6b968e4b9fe93cc6",
      "yj-news.26d92f9ed1817f2dbd97073cc4432ff59e0a6997aeff0151cbce16654847d4a0",
      "yj-news.0cedb8e9abeb36ce9b8517c7201c65f7b2c9bd37be5493d016ae31c2a2d42cfe",
      "yj-news.cd7f1e71612fc35907cbb32139ff8a793d3e0944068b513d687814cd60240549",
      "yj-news.43d694c2f51c31c4ccd9b29e80c84eef41c940f8d20eafd8f0510bcd4639622b",
      "yj-news.526bbe377c1b3ada16c3e26fc94f5f5eae356466bfd6a4aecbdc722b2b76fac7",
      "yj-news.8f8d35f11e7bbdd39cde918d203113d04f9429e79901d3e2f40b712c12ed8aa0",
      "yj-news.53974ff08762f9dc5a3cb338f6babb403e7a381d69f887ec798cb9c92f0d84aa",
      "yj-news.dc3470720cbab8e477da740fd67ef105312149aa92992bba1efd059ee6486299",
      "yj-news.43c69b95349e82aa2c912e03851bff625a1f79fb39d64dbc733086a31218058b",
      "yj-news.f44af5103c42502eb4d8da5f226b135f0b82e7802af36e97bc2808d1b5534950",
      "yj-news.09d36ff6f04abcad366d4ac4e866c46e926e1ae47d36d5d0e192f78ed66bd123",
    ]
    const modifiedArticles = articles
      .filter(a => a.tags.has("山岳事故") && !a.tags.has("__hidden"))
      .filter(a => hiddenKeys.includes(a.toKey().getId()))
      // .filter(a => idList.includes(a.toKey().getId()))
      .map(a => {
        a.tags.delete("__hidden")
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
