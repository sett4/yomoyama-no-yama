import { Express } from "express"
import {
  ArticleRepository,
  FirestoreArticleRepository,
  PrismaArticleRepository,
  IncidentArticle,
  IndexScraper,
} from "../datasource/incident"
import Np24Scraper from "../datasource/incident/np24"
import {
  AddMountainTagProcessor,
  ChatGptPostExtraProcessor,
} from "../datasource/incident/postprocessor"
import { ArticleScrapers } from "../datasource/incident/scraper"
import YahooIndexScraper from "../datasource/incident/yahoo"
import { DictionaryBuilder } from "../datasource/mountain/gsi-prefecture/buildDictionary"
import { getLogger } from "../logger"
import { PrismaClient } from "@prisma/client"
import * as dotenv from "dotenv"
dotenv.config()

const registerHandler = async function (
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  // const repository: ArticleRepository = new FirestoreArticleRepository(
  //   firestore
  // )
  const prisma = new PrismaClient()
  const repository: ArticleRepository = new PrismaArticleRepository(prisma)
  const articleScrapers: ArticleScrapers = new ArticleScrapers()
  const addMountainTagProcessor = new AddMountainTagProcessor()
  await addMountainTagProcessor.initialize()
  articleScrapers.registerPostProcessor(addMountainTagProcessor)

  const chatGptPostExtraProcessor = new ChatGptPostExtraProcessor(
    process.env.OPENAI_API_KEY || "",
    prisma
  )
  await chatGptPostExtraProcessor.initialize()
  articleScrapers.registerPostProcessor(chatGptPostExtraProcessor)

  async function update(
    repository: ArticleRepository,
    indexScraper: IndexScraper,
    articleScraper: ArticleScrapers
  ): Promise<void> {
    getLogger().info(`updateing ${indexScraper.constructor.name}`)
    const articleUrls = await indexScraper.getArticleUrls()

    const allArticle: IncidentArticle[] = []
    for await (const url of articleUrls) {
      const articles = await articleScrapers.scrape(url)
      allArticle.push(...articles)
    }
    getLogger().info(`extract ${allArticle.length} articles.`)

    if (allArticle.length == 0) {
      getLogger().error(`article extraction result is 0. something went wrong?`)
    }

    await Promise.all(
      allArticle.map(async (article) => {
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
      .filter((a) => a.tags.has("山岳事故"))
      .filter((a) => {
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
      .map((a) => {
        a.tags.delete("山岳事故")
        req.log.info("deleted 山岳事故 ", a.toKey().getId(), a.subject, a.url)
        return a
      })

    await Promise.all(
      modifiedArticles.map((article) => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map((e) => e.toData()))
  })

  app.post("/datasource/mountain/incident/remove-tag", async (req, res) => {
    req.log.info("updateing...")
    const prefectureList = new DictionaryBuilder().getPrefectures()
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)
    const modifiedArticles = articles
      .filter((a) => a.tags.has("山岳事故"))
      .filter((a) => prefectureList.filter((p) => a.tags.has(p)))
      // .filter(a => idList.includes(a.toKey().getId()))
      .map((a) => {
        prefectureList.forEach((p) => {
          if (a.tags.has(p)) {
            a.tags.delete(p)
            req.log.info(`deleted ${p} from ${a.toKey().getId()}`)
          }
        })
        return a
      })

    await Promise.all(
      modifiedArticles.map((article) => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map((e) => e.toData()))
  })

  app.post("/datasource/mountain/incident/extract-tags", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)
    const filteredArticles = articles.filter((a) => a.tags.has("山岳事故"))

    const modifiedArticles: IncidentArticle[] = []
    for (const a of filteredArticles) {
      req.log.info(`extracting tags`, a.toKey().getId(), a.subject, a.url)
      modifiedArticles.push(await addMountainTagProcessor.postProcess(a))
    }

    await Promise.all(
      modifiedArticles.map((article) => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map((e) => e.toData()))
  })

  app.post("/datasource/mountain/incident/post-extra", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("np24")
    req.log.info(`loaded ${articles.length} articles`)
    const filteredArticles = articles.filter((a) => a.tags.has("山岳事故"))

    const modifiedArticles: IncidentArticle[] = []
    for (const a of filteredArticles) {
      req.log.info(`extracting extra info`, a.toKey().getId(), a.subject, a.url)
      const article = await chatGptPostExtraProcessor.postProcess(a)
      await repository.save(article)
    }

    res.send(modifiedArticles.map((e) => e.toData()))
  })

  app.post("/datasource/mountain/incident/hide", async (req, res) => {
    req.log.info("updateing...")
    const articles = await repository.findAll("yj-news")
    req.log.info(`loaded ${articles.length} articles`)

    const hiddenKeys: Array<String> = [
      "yj-news.2ca45df1e58dee83b77a5396ae68f563a89f0692327a796c69e4acb9cbdeb649",
      "yj-news.5fc4c2393983b8afa1adfa2944a885ce8982094180b033010bca7665a4a4a10c",
      "yj-news.9bdd550c1914866be047274e6ae3962987e08c562770f502da76d0ce7e4ea480",
      "yj-news.6efb2adadefbb33b2021788ab255a11ec02405facdd70f669ce7a5075b28fd1a",
      "yj-news.3f3779074a5dc00621e4baaad236624ea935e96ed1a296ed3004368e23205324",
      "yj-news.cacf0d6544bcb40c0f0fe8e36b86e66eb529cdc68823a5983b17045ba1d6499b",
      "yj-news.e1e092012867232c9e1f31a59159c8743098967bd65778a8b86ef9b9092ecfc5",
      "yj-news.2f26f2ff1e1723450f02d4beb8f142d16cf2025b3b342b3092efbe9872d8ec11",
      "yj-news.42d841c35aca49c1e184e0ae7e33e782f27b22fe60f7847862abac13c3956224",
      "yj-news.1049561e95bb1585a84084b7eefe50472657b29b123645441ec2cadc2a43ba1d",
      "yj-news.532cb6e177e64f7ca57a18430efedd2fe136dab9b9ed7966bcb928a0ca4ada0d",
      "np24.e3c8b10fb3147f7396a83bc2ac5af430da8c432ab420334e2963a7f05e0f0a43",
      "yj-news.c274df7a15a09f6b4ca5e714cc83ed05032d9a348b3979a008412bdc2480cd8c",
      "yj-news.1f24800a24cdc23eccc2ace18363a5cb34714a91d0ad3399b256c57bd1ca59dd",
      "yj-news.edc1510eca8ff7a5d3eb3757196f5c4ad8cf82fd91f33ff2b37c6c4ea8d3b68a",
      "yj-news.9054c6fdada455d8b9c92ff0bd342329162e3b38bbb62142796c185538504929",
      "yj-news.2528f5f7a5f1efd35a969516ecf7b50978fea2833356db695dfabee1b1883bc0",
      "yj-news.5f977d7d9ee872f7c2b1a5f25a796f4cb8bb21c8bbe3aba45309cca9228492e5",
      "yj-news.fa2ae035f1061018fbc3585a1ad03b42d73d537474554d940db008b7bd61f8cf",
      "yj-news.abb991bc0f456ba7db91410e171b231d6b4de2f5aec128cbbc07ce7687115dad",
      "np24.f5fe56febab5eaf137f61c0f2160d7f1d48a15724a76dd4372a582b5778aa7b5",
      "yj-news.3021d432b6402eb6bba839d3315217de344e56aad51f2c75ba47de7c0a08148d",
      "np24.7d28a1224a410c61b1c6e1fbd11baf3238d05aa0d5752d5a835f1f9f2c64b3f5",
      "yj-news.b93374297900eabcee1d0261d7a2c1cf83229c0f047c32199b8166cd0780bd72",
      "yj-news.5a25a63121e872ab4120cd5676cf270e4fb5de00e5b0080423ec1f22e00893f8",
      "yj-news.f7d49ed6eff699cd5c35d4ab3710ddf7c0ffb903292c16244572242a1b84354a",
      "yj-news.8258bb35d6b1cc8b58b6c2b21814f802809223e98975aa7563b2dfede9f598ac",
      "yj-news.090e89b765203a93130f5a74c9fd6e2f4f80c131325a288fd312784eab944c72",
      "yj-news.dfa20d062bea1cac48a0894ff6ddf5ac7ac10de8b7cffc24d241ba7e167720ce",
      "yj-news.de6b8b33a0face1c284c6420f8315e0ecbd89f5741f80f602e5b2b9b01df9b01",
      "yj-news.7c60382ae03b4d49927ae59f6ed264b0d06ab8702ff6f2f2893c63db293b177a",
      "np24.ff5122af8bcb5cdc253ee5a64a8738aad5a2e1c380c7fa560cebf6f224c26d0d",
      "yj-news.1a16051301a34d0d029c2c2f84bbfb93c42c39b27c67ca8a1952cf373d62cdc9",
      "yj-news.defcb8845b34c80f0a7f137a7df62a705ccb1be877d79375794411bae03efd79",
      "yj-news.7c1b02eff04272ec4bc65462ce9fb8ac8afca5bc0b146ec9f4c55df68b9ce793",
      "yj-news.bd4b7107a61f6368958ff2eb5b233ffc6d0da05cd23d06f3dcbcdd4fe383c0f2",
    ]
    const modifiedArticles = articles
      .filter((a) => a.tags.has("山岳事故") && !a.tags.has("__hidden"))
      .filter((a) => hiddenKeys.includes(a.toKey().getId()))
      // .filter(a => idList.includes(a.toKey().getId()))
      .map((a) => {
        a.tags.add("__hidden")
        req.log.info("add hidden ", a.toKey().getId(), a.subject, a.url)
        return a
      })

    await Promise.all(
      modifiedArticles.map((article) => {
        return repository.save(article)
      })
    )
    res.send(modifiedArticles.map((e) => e.toData()))
  })

  app.get("/datasource/mountain/incident/yahoo/show", async (req, res) => {
    const indexScraper = new YahooIndexScraper()
    const articleUrls = await indexScraper.getArticleUrls()

    const articleScrapers = new ArticleScrapers()
    const allArticle: IncidentArticle[] = []
    for await (const url of articleUrls) {
      const articles = await articleScrapers.scrape(url)
      allArticle.push(...articles)
    }
    req.log.info(`extract ${allArticle.length} articles.`)

    const allArticleData = allArticle.map((a) => a.toData())

    res.send(allArticleData)
  })
}

export { registerHandler }
