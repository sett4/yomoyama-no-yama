const PORT = Number(process.env.PORT) || 8080
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

const app = express()

let credential = admin.credential.applicationDefault()
const c = JSON.parse(fs.readFileSync("./mt-incident-2847996a3e43.json", "utf8"))
credential = admin.credential.cert(c)
admin.initializeApp({
  credential: credential,
  databaseURL: "https://mt-incident.firebaseio.com",
})
const firestore = admin.firestore()

const repository: ArticleRepository = new FirestoreArticleRepository(firestore)

async function update(
  repository: ArticleRepository,
  indexScraper: IndexScraper
): Promise<void> {
  console.info("updateing " + indexScraper.constructor.name)
  const articleScrapers = new ArticleScrapers()
  const articleUrls = await indexScraper.getArticleUrls()

  const articlePromise = articleUrls.map(url => {
    return articleScrapers.scrape(url)
  })
  const allPromise = await Promise.all(articlePromise)
  const allArticle = allPromise
    .reduce((acc, curr) => acc.concat(curr), [])
    .filter(a => a)

  console.info(`extract ${allArticle.length} articles.`)

  Promise.all(
    allArticle.map(article => {
      console.info(`${article.url} ${article.toKey().getId()}`)
      return repository.save(article)
    })
  )
}

app.get("/", (req, res) => {
  res.send("🎉 Hello TypeScript! 🎉")
})

app.get("/datasource/mountain/np24/update", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    if (req.header("X-Appengine-Cron") !== "true") {
      res.send("NG")
      res.status(401)
      return
    }
  }
  console.info("updateing np24")
  const indexScraper = new Np24Scraper()
  await update(repository, indexScraper)
  res.send("OK")
})

app.get("/datasource/mountain/yahoo/update", async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    if (req.header("X-Appengine-Cron") !== "true") {
      res.send("NG")
      res.status(401)
      return
    }
  }
  console.info("updateing yahoo")
  const indexScraper = new YahooIndexScraper()
  await update(repository, indexScraper)
  res.send("OK")
})

app.get("/datasource/modify", async (req, res) => {
  console.info("updateing...")
  const articles = await repository.findAll("yj-news")
  console.info(`loaded ${articles.length} articles`)
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
      console.info("deleted 山岳事故 ", a.toKey().getId(), a.subject, a.url)
      return a
    })

  await Promise.all(
    modifiedArticles.map(article => {
      return repository.save(article)
    })
  )
  res.send(modifiedArticles.map(e => e.toData()))
})

app.get("/datasource/mountain/hide", async (req, res) => {
  console.info("updateing...")
  const articles = await repository.findAll("yj-news")
  console.info(`loaded ${articles.length} articles`)

  const hiddenKeys = [
    "nhk-l.4f17883b6d5272dc9c84b2f26a06ad69442a8977b522c1e6d05ec5c8c1eee678",
    "nhk-l.58a81e606b711844bcea33bb4d2ec674a130a654ed09575dceb0145ab76d4073",
    "nhk-l.8f33d59d093996b75d1b7dab2f267b91b569261110226a2d6dc08f5485bfbfec",
    "nhk-l.94316a8651179a8e41d41b882d7c95d7578a36639d61ab6000b0bbb1bc97edd1",
    "nhk-l.ba87d4b52adde2345a6f4480e5b33a1e1fadd72735a42909819107ae1b7a6448",
    "nhk.0486175bac5d2890135db0336fb0e50d406c153469a7cb58576a0b72e91a8381",
    "nhk.8ad3e95dd37c52f45d4da5400a1a76bb7ad3de1e1a18e13fe2e4578f0b29a168",
    "nhk.8d2d9db3225425189d3124f5145316335063b3ca4103dbd9d023c40e3d7e8e0e",
    "nhk.96d0ff5156976f27f0e2ed760334d19e3ed3517bda1555a74666b7e1b1d283e8",
    "yj-news.03d5d839b33ae4898643061d13e55ba2436e750d5e71a6363816bb5dc6cddcb1",
    "yj-news.05f616a19f3d71dd618ed4a0c59ecb97da4a5b6c61398308636cdd354888a84c",
    "yj-news.0b636b451495cd08e2d178090df61bce032d637eb2b8dcb6d4d0beec0a026193",
    "yj-news.156bf4350959db307c3f1e98c5ccf548f4273f5239bd978fa7b55eaa04274b1c",
    "yj-news.25617dc05b61a77a26d911b3231524f3b23d44469083d5ecde98ff55f3a57d23",
    "yj-news.317d09d80f559d6ae70f6a164f5fde527ac565cc4ffb3be757373bd373c85006",
    "yj-news.361118a0b6cc1340e6d1948c8da606749e3c6fced090d960aa8c68e7e5b8994e",
    "yj-news.3ab0ef026361c1064cff6f641bedf37e187f3d9ab5783851a5b832bf14cda800",
    "yj-news.4ea5577499524200b7461839e66aa0abd87c8ee95bf2486281385416533c54d7",
    "yj-news.4f33300e02911d2e9962fa6eeb1064c20e4f7d3f18a469320fd2e23d40208ef9",
    "yj-news.4fa7223f988ad8ca443a59e1f388ea7fff7055928c30287af76cc0399fe40357",
    "yj-news.4faa65a2b6d4093cca703ec54e8f2eb6af7f0f6227dee897591a2d7ba008739b",
    "yj-news.5113a680f41bb04792eb4c4e0db9d412ec733bfa2a91499bc43397296d5b239e",
    "yj-news.58bd667fd480294625fad812f6453c00032093086f27dd88a04fc97b1bb26357",
    "yj-news.5a840a27d1c30e5a662c4b5c75e502ef443ef6eb842f021f017e2e0c29c2396c",
    "yj-news.63ec9ea757dbd5a41cecda7765b45875b27a4b2999e734c02f4ca538f32139be",
    "yj-news.6bb68ae73f64930a4f33795b2d555a1387678deb4ee17ca21fa30ad721e0cad2",
    "yj-news.72f5c164ebcea2a24ce69c994782ffa887fb0fa45920bd8aecec890fc4160066",
    "yj-news.7739c307027b9f562424c85073750dd86476f5928d00fc59d6c249ffa3759447",
    "yj-news.77522642253aceb2e744e20b1f963145566aa42606d8ecd7859e120c6431dc12",
    "yj-news.7aa4750553c07d9b14534b52f9878cc3783daff01e9ab5d50d56d7b42983f6f7",
    "yj-news.7b1b27144d34087fe2524bfda32882e7005338d00df4dd9cab8b1e6e071bf668",
    "yj-news.810ed3972c5a4373550f0d46dfbc881cab9bda5bbd67fca0e9ca1a4d66aedcea",
    "yj-news.815d2a656d533f29d4c96920f3b4b0a2129308a46a2015247656bc6306c803a9",
    "yj-news.849cedb23ce797c7e83353792f223cdef7c3f0d803e64712234fd0397fc9d68d",
    "yj-news.893ca16dfd7a19091be262e37fb495a0b376d08f93e381e2cb26ac9d4aca7054",
    "yj-news.8b49d7b5bc407eb1fa2d49da05f487c39e04e0ab02f870e6cccdba7fd7afd4b9",
    "yj-news.932ed8bca4eef6e52809faf8f3101b76d1fe633a7ad5341689f5ccfdf3883479",
    "yj-news.97883ee2a96ec9ecbac76606fa2479f49880b485ac01b23d77bf5d319ccbc49d",
    "yj-news.9bab05312bb8a7e644804039017f052ba75e6bc521fc5b71cfb3db542ef78072",
    "yj-news.b3888d281e650a2253486c8fa049a8c39e12a48164c07ab894f1c5a7594fc283",
    "yj-news.b3e8bad14f3813fb339aeb8f9546b45452f6a08638cfa6185988cf0b96e72b34",
    "yj-news.b4e2f68782e54b5708d15a8eeab411e112ea91ecd354a7d736f4513a99474eae",
    "yj-news.b9a9c8b9bab2832336d2920511b33c4b641659f6749c652218eec99164bf6e87",
    "yj-news.bad9b1f9049826c857c2d1be5172f268270f4f8734cd65de6c2189421aea2b37",
    "yj-news.bb41bd69c45895135e7d2116275a16d1a2301df75077f5b1be5c4db114b25916",
    "yj-news.bd558d1e1ba43b4c3a9fb4f1673bae4481eeb3e5d4543da3d9c9348211086443",
    "yj-news.c05d747de2526b4e3a9124ee108547356c3f0914a5029c194b2ddcf9832fd0be",
    "yj-news.c6deb1593f9dbbdbf71de2ff7cd721be2bc36c902d0dd303fc601bfafc21e1b2",
    "yj-news.c9d012b823af03626d155b99fa51af7d4faccf633db9ff6f02d9e7a5ccdd00b3",
    "yj-news.cc9576e4ae8c93c5284ed107a99d4107e2d4dd2de909ac03f8f5c2dde8f923fb",
    "yj-news.cf8c18e442e21bb8dd213c8c9a63dba60311d425b129061d0960e5eb6527025a",
    "yj-news.db278fbbd1a4fc5790502ca634661e75243253d3a797a3d1b63dc1954e7a20a0",
    "yj-news.e27ad1f8ac5272ef2891c400ca8a8a1fcb1753679d7906f0f19bdcf6acaba17f",
    "yj-news.e5ac12a0bc6059af97803c0014b53578425d96dc59e40d87eeb2ec831485ea1e",
    "yj-news.ead94e9231bf1ce94b8ea7e830c8adc16775b29d73ca7354899012372d5182a0",
    "yj-news.f2b4548ddff4c8badca986daa5656ec69d0e8819cd61ad45bc4609aec952bdbf",
    "yj-news.feddd1a0947d7ed6c9577f24326065dc9592a90eda7ad077670afbe09f3b8a88",
    "nhk-l.60517c4e804cce689eec741e425c8c2ee4d53e15d4dc45754f9a4cb5ef7d6e3e",
    "nhk-l.61d5036ee941703c0dd2dc8830153baa9943eb5078a83cae4495373b39604556",
    "nhk-l.6c8dda7b3b9cd91f51c2e0b95f6abdc1a79c3109939f7d983de8ce76495e738e",
    "nhk-l.8b14c8e69a09ec318c3b02b545eab76b169ab3940abea725da92688fad7e9cb1",
    "nhk-l.af48e5114ed00307d49d3528da32bd51398c5a6eafa4e472d6d3b861867ea2b2",
    "nhk-l.b76c104ff9df71a4c7ed3e9892543176b87cbeb9348e694be9b323e567cc468d",
    "nhk-l.bddafa888679810a3ac17882bda5a3c610e52654b6b482fdf8346b6ba093f84f",
    "nhk-l.fd55602dcebe25b803237176fbcd39e64de3800d35f0a3965b194b80248d9a23",
    "nhk.2c817a1b7316ac5f692708ded67935dea3908b5593990253721385988b9691ad",
    "nhk.801660385f5dae04732ac1921ef2ec3d324bf982c653352ebd842cab2254f0ce",
    "nhk.81b4b505f97cf4b8b87c05d0ed857400143820ae82e161e1df4d36b6c188dd28",
    "nhk.cefab6244c06243f410a64ba4746f2242e2d977d5dffe7e2b10032a418948d9c",
    "nhk.de39e50405a7168814130acf0f41e0666cd2efb2f03cd17211b3c19f298fbb54",
    "nhk.f8ae5b501e5176b7b753dc70cbc1edf29abb739b6c7e3e95a08721342584fe6f",
    "nhk.fc3a1d3e808add10a3da69911a19a6b40c0b753911077fadf5abf7185fe3b593",
    "yj-news.24e4464e5c8aa63d7816c4bf1f9673bf908e6b63833b50db83d95a0aae54241a",
    "yj-news.4744795c2cf0a7e8fe3ad9c52c40c3fc8e7cc5e9c6644848074e531082b16e49",
    "yj-news.5bb1b0e911109a8576ebef882c000db5417231824a75b8f4771b5c67559fee19",
    "yj-news.b0ea1a0f2ede308aadd02b5395330444b0a39045b2075cba5c9c28b055e8c0ea",
    "yj-news.b512bb7282d8ead8cf4d98ddf983fadea2f0ede2cb68e09f1c3382dac2ce243c",
    "yj-news.ba38d95a61caf9973a05f2f623d5b85400f91afa99ec30a1c27ec9f1483fbe01",
    "yj-news.c491bc641083b5ab4c04b17b9d9434b02ba8e032bbd8df866bb0c5aa17820163",
    "yj-news.de9e74ee975fdea041aba3c4088c6b33e28309ef51c85dcdac6e60c2ea7743ff",
    "yj-news.e1d48eef31a999f21e47c7b8c46181f1cd9bc6358aaeb4efd90c904211c40aa4",
    "yj-news.ebeec16e58c452aae3664ac0096cdddd9de8e06235e7e26dadd728949dde8090",
  ]
  const modifiedArticles = articles
    .filter(a => a.tags.has("山岳事故") && !a.tags.has("hidden"))
    .filter(a => hiddenKeys.includes(a.toKey().getId()))
    // .filter(a => idList.includes(a.toKey().getId()))
    .map(a => {
      a.tags.add("hidden")
      console.info("add hidden ", a.toKey().getId(), a.subject, a.url)
      return a
    })

  await Promise.all(
    modifiedArticles.map(article => {
      return repository.save(article)
    })
  )
  res.send(modifiedArticles.map(e => e.toData()))
})

app.get("/datasource/mountain/yahoo/show", async (req, res) => {
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

  console.info(`extract ${allArticle.length} articles.`)

  res.send(allArticle)
})

async function notifyToNetlify(): Promise<void> {
  if (process.env.NETLIFY_HOOK_URL) {
    const hookUrl: string = process.env.NETLIFY_HOOK_URL
    await axios.post(hookUrl, {})
    console.info(`nofity to netlify ${hookUrl}`)
  } else {
    console.info(
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
  console.info("test")
  res.send("OK")
})
app.get("/datasource/mountain/gsi/raw-to-test", async (req, res) => {
  const importer = new IndexImporter("experimental_nnfpt", firestore)
  await importer.updateAllMountain()
  console.info("test")
  res.send("OK")
})

app.listen(PORT, () => {
  console.info(`App listening on port ${PORT}`)
})
