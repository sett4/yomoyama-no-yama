// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const PORT = Number(process.env.PORT) || 8080
import express from "express"
import Np24Scraper from "./datasource/incident/np24"
import {
  EmptyArticleRepository,
  FirestoreArticleRepository,
  ArticleRepository,
  IndexScraper,
} from "./datasource/incident"
import axios from "axios"
import { ArticleScrapers } from "./datasource/incident/scraper"
import YahooIndexScraper from "./datasource/incident/yahoo"
import { firestore } from "firebase-admin"
const app = express()

let repository: ArticleRepository
if (process.env.NODE_ENV !== "development") {
  repository = new FirestoreArticleRepository()
} else {
  repository = new EmptyArticleRepository()
}

app.get("/", (req, res) => {
  res.send("🎉 Hello TypeScript! 🎉")
})

app.get("/datasource/np24/update", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    if (req.header("X-Appengine-Cron") !== "true") {
      res.send("NG")
      res.status(401)
      return
    }
  }
  console.info("updateing np24")
  let indexScraper = new Np24Scraper()
  await update(repository, indexScraper)
  res.send("OK")
})

app.get("/datasource/yahoo/update", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    if (req.header("X-Appengine-Cron") !== "true") {
      res.send("NG")
      res.status(401)
      return
    }
  }
  console.info("updateing yahoo")
  let indexScraper = new YahooIndexScraper()
  await update(repository, indexScraper)
  res.send("OK")
})

async function update(
  repository: ArticleRepository,
  indexScraper: IndexScraper
): Promise<void> {
  console.info("updateing yahoo")
  let articleScrapers = new ArticleScrapers()
  let articleUrls = await indexScraper.getArticleUrls()

  let articlePromise = articleUrls.map(url => {
    return articleScrapers.scrape(url)
  })
  let allPromise = await Promise.all(articlePromise)
  let allArticle = allPromise
    .reduce((acc, curr) => acc.concat(curr), [])
    .filter(a => a)

  console.info(`extract ${allArticle.length} articles.`)

  Promise.all(
    allArticle.map(article => {
      return repository.save(article)
    })
  )
}

app.get("/datasource/modify", async (req, res) => {
  console.info("updateing...")
  const articles = await repository.findAll("yj-news")
  console.log(`loaded ${articles.length} articles`)
  const modifiedArticles = articles
    .filter(a => a.tags.has("山岳事故"))
    .filter(a => {
      if (
        // (a.content + a.subject).match(/遭難/)
        a.content.match(
          /(指名式|追悼|指定式|発隊式|開始式|祈願|訓練を|開設|会議|ワニ|政府|地震|ヨット|訓示|注意点|観光|約束)/
        )
      ) {
        return true
      } else {
        return false
      }
    })
    // .filter(a => idList.includes(a.toKey().getId()))
    .map(a => {
      a.tags.add("山岳事故")
      console.log("deleted 山岳事故 ", a.toKey().getId())
      return a
    })

  await Promise.all(
    modifiedArticles.map(article => {
      return repository.save(article)
    })
  )
  res.send(modifiedArticles)
})

app.get("/datasource/yahoo/show", async (req, res) => {
  let indexScraper = new YahooIndexScraper()
  let articleUrls = await indexScraper.getArticleUrls()

  let articleScrapers = new ArticleScrapers()
  let articlePromise = articleUrls.map(url => {
    return articleScrapers.scrape(url)
  })
  let allPromise = await Promise.all(articlePromise)
  let allArticle = allPromise
    .reduce((acc, curr) => acc.concat(curr), [])
    .filter(a => a)
    .map(a => a.toData())

  console.info(`extract ${allArticle.length} articles.`)

  res.send(allArticle)
})

app.get("/generate", async (req, res) => {
  await notifyToNetlify()
  res.send("UPDATED")
})

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`)
})

async function notifyToNetlify() {
  if (process.env.NETLIFY_HOOK_URL) {
    let hookUrl: string = process.env.NETLIFY_HOOK_URL
    await axios.post(hookUrl, {})
    console.info(`nofity to netlify ${hookUrl}`)
  } else {
    console.info(
      "netlify rebuild hook skipped. due to process.env.NETLIFY_HOOK_URL is empty."
    )
  }
}
