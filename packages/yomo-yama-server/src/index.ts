const PORT = Number(process.env.PORT) || 8080
import * as lb from "@google-cloud/logging-bunyan"
import express from "express"
import fs from "fs"
import zlib from "zlib"
import Np24Scraper from "./datasource/incident/np24"
import {
  // EmptyArticleRepository,
  FirestoreArticleRepository,
  ArticleRepository,
  IndexScraper,
} from "./datasource/incident"
import axios from "axios"
import { ArticleScrapers } from "./datasource/incident/scraper"
import YahooIndexScraper from "./datasource/incident/yahoo"
import { IndexImporter } from "./datasource/mountain/gsi/convert2db"
import * as admin from "firebase-admin"

async function startServer() {
  const app = express()
  const { logger, mw } = await lb.express.middleware({
    logName: "yomoyama-server",
  })
  app.use(mw)

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
  const firestore = admin.firestore()

  const repository: ArticleRepository = new FirestoreArticleRepository(
    firestore
  )

  async function update(
    repository: ArticleRepository,
    indexScraper: IndexScraper
  ): Promise<void> {
    logger.info("updateing " + indexScraper.constructor.name)
    const articleScrapers = new ArticleScrapers()
    const articleUrls = await indexScraper.getArticleUrls()

    const articlePromise = articleUrls.map(url => {
      return articleScrapers.scrape(url)
    })
    const allPromise = await Promise.all(articlePromise)
    const allArticle = allPromise
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter(a => a)

    logger.info(`extract ${allArticle.length} articles.`)
    if (allArticle.length == 0) {
      logger.error(`article extraction result is 0. something went wrong?`)
    }

    Promise.all(
      allArticle.map(article => {
        logger.info(`${article.url} ${article.toKey().getId()}`)
        return repository.save(article)
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

    const hiddenKeys: Array<String> = []
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
    const articlePromise = articleUrls.map(url => {
      return articleScrapers.scrape(url)
    })
    const allPromise = await Promise.all(articlePromise)
    const allArticle = allPromise
      .reduce((acc, curr) => acc.concat(curr), [])
      .filter(a => a)
      .map(a => a.toData())

    req.log.info(`extract ${allArticle.length} articles.`)

    res.send(allArticle)
  })

  async function notifyToNetlify(): Promise<void> {
    if (process.env.NETLIFY_HOOK_URL) {
      const hookUrl: string = process.env.NETLIFY_HOOK_URL
      await axios.post(hookUrl, {})
      logger.info(`nofity to netlify ${hookUrl}`)
    } else {
      logger.info(
        "netlify rebuild hook skipped. due to process.env.NETLIFY_HOOK_URL is empty."
      )
    }
    return
  }

  app.get("/generate", async (req, res) => {
    await notifyToNetlify()
    res.send("UPDATED")
  })

  app.get("/datasource/mountain/gsi/index", async (req, res) => {
    const stream = fs
      .createReadStream("data/mokuroku-experimental_nnfpt.csv.gz")
      .pipe(zlib.createGunzip())

    const importer = new IndexImporter("experimental_nnfpt", firestore)
    await importer.importIndex(stream)
    res.send("OK")
  })
  app.get("/datasource/mountain/gsi/update-raw", async (req, res) => {
    const importer = new IndexImporter("experimental_nnfpt", firestore)
    await importer.updateAllContent()
    req.log.info("test")
    res.send("OK")
  })
  app.get("/datasource/mountain/gsi/raw-to-test", async (req, res) => {
    const importer = new IndexImporter("experimental_nnfpt", firestore)
    await importer.updateAllMountain()
    req.log.info("test")
    res.send("OK")
  })

  app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`)
  })
}

startServer()
