import fs from "fs"
import zlib from "zlib"
// eslint-disable-next-line @typescript-eslint/no-var-requires
const JSONStream = require("JSONStream")
import { logger } from "../logger"
import csv from "fast-csv"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const minimist = require("minimist")
const argv = minimist(process.argv.slice(2))

const csvStream = csv.format({ headers: true })
csvStream.pipe(process.stdout).on("end", process.exit)

fs.createReadStream("./data/N03-19_190101.geojson.gz")
  .pipe(zlib.createGunzip())
  .pipe(JSONStream.parse("features.*"))
  .on("data", (chunk: any) => {
    const polygon: Array<number[]> = chunk.geometry.coordinates[0]
    const points = polygon
      .map((coordinate) => `${coordinate[0]} ${coordinate[1]}`)
      .join(",")
    const wkt = `POLYGON((${points}))`
    const line = {
      N03_001: chunk.properties.N03_001,
      N03_002: chunk.properties.N03_002,
      N03_003: chunk.properties.N03_003,
      N03_004: chunk.properties.N03_004,
      N03_005: chunk.properties.N03_005,
      N03_006: chunk.properties.N03_006,
      N03_007: chunk.properties.N03_007,
      POLYGON: wkt,
    }
    csvStream.write(line)
  })
//   .end(() => {
//     csvStream.end()
//   })
