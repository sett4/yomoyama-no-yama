import * as fs from "fs"
import * as path from "path"
import { performance } from "perf_hooks"
import ms from "ms"
import { createDbClient } from "./client"
import { ensureCategory, upsertPost } from "./queries"

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + "..."
}

function postObjectToPost(
  categoryId: string,
  postObj: { key: string; post: any }
) {
  const j = postObj.post
  const published =
    j["tags"].includes("山岳事故") && !j["tags"].includes("hidden")
  const content =
    j["tags"].includes("__private-use") || j["tags"].includes("__private_use")
      ? truncateString(j["content"], 120)
      : j["content"]
  const tags = (j["tags"] as string[])
    .filter((o) => !["hidden"].includes(o))
    .sort()
    .join(",")
  return {
    publishedAt: new Date(j["date"]),
    title: j["subject"],
    content: content,
    contentType: "incident",
    categoryId,
    rawContent: j["content"],
    published: published,
    author: "",
    source: j["source"],
    sourceUrl: j["url"],
    slug: postObj.key,
    scraper: j["source"],
    tags: tags,
  }
}

async function loadIncidentFromJsonFile() {
  const { client, db } = createDbClient()
  const category = await ensureCategory(db, "incident")

  const filePath = path.join(__dirname, "../seed-data/incident-backup.json")
  const data = fs.readFileSync(filePath)
  const json = JSON.parse(data.toString())
  const incidents = Object.keys(json)
    .filter((key) => {
      const j = json[key]
      return j["tags"].includes("山岳事故")
    })
    .map((key) => {
      return { key: key, post: json[key] }
    })

  let totalUpdateCount = 0
  for (const incident of incidents) {
    const post = postObjectToPost(category.id, incident)
    await upsertPost(db, post)
    totalUpdateCount += 1
  }

  client.close()
  return totalUpdateCount
}

async function main() {
  const start = performance.now()
  const totalUpdateCount = await loadIncidentFromJsonFile()
  console.info({
    location: "seed.incident",
    duration: ms(performance.now() - start),
    totalUpdateCount,
  })
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
