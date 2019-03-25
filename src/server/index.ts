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
import { Np24Scraper } from './datasource/np24'
import { EmptyArticleRepository, FirestoreArticleRepository } from './datasource'
import axios from "axios";
const app = express();

app.get("/", (req, res) => {
  res.send("🎉 Hello TypeScript! 🎉");
});

app.get("/datasource/np24/update", async (req, res) => {
  if (req.header('X-Appengine-Cron') !== 'true') {
    res.send('NG')
    res.status(401)
    return;
  }
  console.warn("updateing np24")
  let np24scraper = new Np24Scraper(new FirestoreArticleRepository());
  let result = await np24scraper.update()
  await notifyToNetlify()
  res.send(result)
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