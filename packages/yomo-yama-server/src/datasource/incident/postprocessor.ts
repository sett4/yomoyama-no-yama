import { Trie } from "@tanishiking/aho-corasick"
import { IncidentArticle } from "."
import fs from "fs"
import zlib from "zlib"
import { DictionaryBuilder } from "../mountain/gsi-prefecture/buildDictionary"
import { log } from "../../logger"

export interface ArticlePostProcessor {
  postProcess(article: IncidentArticle): Promise<IncidentArticle>
}

export class AddMountainTagProcessor {
  private mountainTrie: Trie

  constructor() {
    this.mountainTrie = new Trie()
  }

  async initialize() {
    log.info("initializing Mountain name Trie.")
    const stream = fs
      .createReadStream(
        "src/datasource/mountain/gsi-prefecture/gsi_experimental_nnfpt_with_prefecture.csv.gz"
      )
      .pipe(zlib.createGunzip())

    const dictionaryBuilder = new DictionaryBuilder()
    const mountainList = await dictionaryBuilder.loadMountains(stream)
    this.mountainTrie = await dictionaryBuilder.build(mountainList)
    log.info("initializing Mountain name Trie. finished.")
  }

  async postProcess(article: IncidentArticle): Promise<IncidentArticle> {
    const tags = this.extractMountain(this.mountainTrie, article.content)
    if (tags.length > 0) {
      log.info(`tags ${tags}`)
    }
    tags
      .filter(
        t =>
          !t.match(
            "[都道府県]$"
          ) /* 富山県に富山をマッチさせないために富山県を辞書に入れてある。でも、都道府県名は要救助者の住んでいる県としてでることもあるので除外する*/
      )
      .forEach(t => article.tags.add(t))
    return article
  }

  extractMountain(trie: Trie, content: string): string[] {
    const emitted = trie.parseText(content)

    return Array.from(new Set(emitted.map(e => e.keyword)))
  }
}
