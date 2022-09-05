import { parseStream } from "@fast-csv/parse"
import { Readable } from "stream"
import { Trie, Emit } from "@tanishiking/aho-corasick"

export type Mountain = {
  key: string
  sourceType: string
  sourcePath: string
  name: string
  kana: string
  romaji: string
  lfSpanFr: string
  klass: string
  type: string
  altName: string
  altKana: string
  altRomaji: string
  geohash: string
  long: number
  lat: number
  location_prefecture: string
  location_l2: string
  location_l3: string
  location_l4: string
  location_l5: string
  location_l6: string
}

export class DictionaryBuilder {
  async build(mountains: Mountain[]): Promise<Trie> {
    const mountainNames: string[] = mountains.map(e => e.name)
    const trie = new Trie(Array.from(new Set<string>(mountainNames).keys()), {
      allowOverlaps: false,
      onlyWholeWords: true,
    })
    return trie
  }

  async loadMountains(stream: Readable): Promise<Mountain[]> {
    return new Promise<Mountain[]>((resolve, reject) => {
      const result: Mountain[] = []
      parseStream(stream)
        .on("data", (data: any[]) => {
          const v: Mountain = {
            key: data[0],
            sourceType: data[1],
            sourcePath: data[2],
            name: data[13],
            kana: data[5],
            romaji: data[12],
            lfSpanFr: data[6],
            klass: data[7],
            type: data[10],
            altName: data[11],
            altKana: data[3],
            altRomaji: data[9],
            geohash: data[14],
            long: data[4],
            lat: data[8],
            location_prefecture: data[15],
            location_l2: data[16],
            location_l3: data[17],
            location_l4: data[18],
            location_l5: data[19],
            location_l6: data[20],
          }
          if (this.canAccept(v)) {
            result.push(v)
          }
        })
        .on("end", () => {
          resolve(result)
        })
        .on("error", err => {
          reject(err)
        })
    })
  }

  canAccept(mountain: Mountain): boolean {
    if (
      ["登山", "入山", "下山", "高原", "高山", "長谷"].includes(mountain.name)
    ) {
      return false
    }
    if (
      ["島", "河川", "海峡・水道", "海岸・浜・磯", "湾・灘"].includes(
        mountain.type
      )
    ) {
      return false
    }
    return true
  }
}
