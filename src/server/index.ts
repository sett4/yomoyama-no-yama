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

const PORT = Number(process.env.PORT) || 8080;
import express from "express";
import Np24Scraper from './datasource/np24'
import { EmptyArticleRepository, FirestoreArticleRepository, ArticleRepository, IndexScraper } from './datasource'
import axios from "axios";
import { ArticleScrapers } from "./datasource/articleScraper";
import YahooIndexScraper from "./datasource/yahoo";
const app = express();

app.get("/", (req, res) => {
  res.send("🎉 Hello TypeScript! 🎉");
});

app.get("/datasource/np24/update", async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    if (req.header('X-Appengine-Cron') !== 'true') {
      res.send('NG')
      res.status(401)
      return;
    }
  }
  console.info("updateing np24")
  let indexScraper = new YahooIndexScraper()
  await update(indexScraper)
  await notifyToNetlify()
  res.send("OK")
})

app.get("/datasource/yahoo/update", async (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    if (req.header('X-Appengine-Cron') !== 'true') {
      res.send('NG')
      res.status(401)
      return;
    }
  }
  console.info("updateing yahoo")
  let indexScraper = new YahooIndexScraper()
  await update(indexScraper)
  await notifyToNetlify()
  res.send("OK")
})

async function update(indexScraper: IndexScraper): Promise<void> {
  let repository: ArticleRepository;
  if (process.env.NODE_ENV !== 'development') {
    repository = new FirestoreArticleRepository();
  } else {
    repository = new EmptyArticleRepository();
  }
  console.info("updateing yahoo")
  let articleScrapers = new ArticleScrapers()
  let articleUrls = await indexScraper.getArticleUrls()

  let articlePromise = articleUrls.map(url => {
    return articleScrapers.scrape(url)
  })
  let allPromise = (await Promise.all(articlePromise))
  let allArticle = allPromise.reduce((acc, curr) => acc.concat(curr), []).filter(a => a)

  console.info(`extract ${allArticle.length} articles.`)

  Promise.all(allArticle.map(article => {
    return repository.save(article)
  }));
}


app.get("/datasource/yahoo/detail", async (req, res) => {
  let articleScrapers = new ArticleScrapers()
  let articleUrls = ['https://headlines.yahoo.co.jp/videonews/nnn?a=20190325-00000138-nnn-soci', 'https://headlines.yahoo.co.jp/hl?a=20190325-00349046-sbcv-l20']

  let articlePromise = articleUrls.map(url => {
    return articleScrapers.scrape(url)
  })
  let allPromise = (await Promise.all(articlePromise))
  let allArticle = allPromise.reduce((acc, curr) => acc.concat(curr), []).filter(a => a)

  console.info(`extract ${allArticle.length} articles.`)

  res.send(allArticle)
})

app.get("/datasource/yahoo", async (req, res) => {
  let indexScraper = new YahooIndexScraper();
  let articleUrls = await indexScraper.getArticleUrls()

  let articleScrapers = new ArticleScrapers()
  let articlePromise = articleUrls.map(url => {
    return articleScrapers.scrape(url)
  })
  let allPromise = (await Promise.all(articlePromise))
  let allArticle = allPromise.reduce((acc, curr) => acc.concat(curr), []).filter(a => a)

  console.info(`extract ${allArticle.length} articles.`)

  res.send(allArticle)
})


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

async function notifyToNetlify() {
  if (process.env.NETLIFY_HOOK_URL) {
    let hookUrl: string = process.env.NETLIFY_HOOK_URL
    await axios.post(hookUrl, {})
    console.info(`nofity to netlify ${hookUrl}`)
  } else {
    console.info("netlify rebuild hook skipped. due to process.env.NETLIFY_HOOK_URL is empty.")
  }
}