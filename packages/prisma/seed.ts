import { Prisma, Category, PrismaClient } from "@prisma/client"
// import {
//   Category,
//   Post,
//   createContext,
//   PrismaClient,
// } from "@sett4/yomo-yama-prisma-client"

import * as fs from "fs"
import * as path from "path"
import { performance } from "perf_hooks"
import ms from "ms"

async function seedCategory(prisma: PrismaClient) {
  const categoryIncident = await prisma.category.upsert({
    where: { name: "incident" },
    update: {},
    create: {
      name: "incident",
    },
  })
  console.log({ categoryIncident })
}

function truncateString(str: string, num: number): string {
  if (str.length <= num) {
    return str
  }
  return str.slice(0, num) + "..."
}

function postObjectToPost(
  category: Category,
  postObj: { key: string; post: any }
) {
  const j = postObj.post
  const published =
    j["tags"].includes("山岳事故") && !j["tags"].includes("hidden")
  const content = j["tags"].includes("__private_use", "__private-use")
    ? truncateString(j["content"], 280)
    : j["content"]
  const tags = (j["tags"] as string[])
    .filter((o) => !["__private_use", "__private-use"].includes(o))
    .sort()
    .join(",")
  return {
    publishedAt: new Date(j["date"]),
    title: j["subject"],
    content: content,
    contentType: "incident",
    categoryId: category.id,
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

async function loadIncidentFromJsonFile(prisma: PrismaClient) {
  const category = await prisma.category.findFirstOrThrow({
    where: { name: "incident" },
  })

  const filePath = path.join(__dirname, "./seed-data/incident-backup.json")
  const data = fs.readFileSync(filePath)
  const json = JSON.parse(data.toString())
  const incidents = []
  const queries = Object.keys(json)
    .filter((key) => {
      const j = json[key]
      return j["tags"].includes("山岳事故")
    })
    .map((key) => {
      return { key: key, post: json[key] }
    })
    .map((postObj) => {
      const post = postObjectToPost(category, postObj)
      return prisma.post.upsert({
        where: { postKey: { categoryId: category.id, slug: post.slug } },
        update: post,
        create: post,
      })
    })
  const chunkSize = 50
  let totalUpdateCount = 0
  for (let i = 0; i < queries.length; i += chunkSize) {
    performance.mark("incident-chunk-upsert-start")
    const chunk = queries.slice(i, i + chunkSize)
    const result = await prisma.$transaction(chunk)
    totalUpdateCount += result.length
    performance.mark("incident-chunk-upsert-end")
    performance.measure(
      "incident-chunk-upsert-diff",
      "incident-chunk-upsert-start",
      "incident-chunk-upsert-end"
    )
    console.info({
      location: "seed.incident.chunk",
      duration: ms(
        performance.getEntriesByName("incident-chunk-upsert-diff")[0].duration
      ),
      chunkSize: chunk.length,
      totalUpdateCount,
    })
  }
}

async function main() {
  const prisma = new PrismaClient()
  performance.mark("start")
  await seedCategory(prisma)
  performance.mark("seedCategoryEnd")
  performance.measure("seedCategoryDiff", "start", "seedCategoryEnd")
  console.info({
    locatioin: "seed.category",
    duration: ms(performance.getEntriesByName("seedCategoryDiff")[0].duration),
  })
  await loadIncidentFromJsonFile(prisma)
  performance.mark("loadIncidentFromJsonFileEnd")
  performance.measure(
    "loadIncidentFromJsonFileDiff",
    "seedCategoryEnd",
    "loadIncidentFromJsonFileEnd"
  )
  console.info({
    location: "seed.incident",
    duration: ms(
      performance.getEntriesByName("loadIncidentFromJsonFileDiff")[0].duration
    ),
  })
  performance.mark("end")
  performance.measure("seedDiff", "start", "end")
  console.info({
    location: "seed",
    duration: ms(performance.getEntriesByName("seedDiff")[0].duration),
  })
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
