process.env.FIRESTORE_EMULATOR_HOST = "localhost:7080"

import assert from "power-assert"
import * as admin from "firebase-admin"

import fs from "fs"
import zlib from "zlib"

import { DictionaryBuilder } from "./buildDictionary"
import { Trie } from "@tanishiking/aho-corasick"

const projectId = "mt-incident"

describe("parse mountain csv", () => {
  test("hoge", () => {
    assert.equal(1, 1)
  })
  describe("ビルドのテスト", () => {
    test("ビルド結果を用いて山を抽出", async () => {
      const stream = fs
        .createReadStream(
          "src/datasource/mountain/gsi-prefecture/gsi_experimental_nnfpt_with_prefecture.csv.gz"
        )
        .pipe(zlib.createGunzip())

      const dictionaryBuilder = new DictionaryBuilder()
      const mountainList = await dictionaryBuilder.loadMountains(stream)
      assert.ok(mountainList.length > 0)
      const trie: Trie = await dictionaryBuilder.build(mountainList)
      const emitList = trie.parseText(
        "テレビ大分２９日午前、由布市湯布院町の由布岳で登山客のガイドをしていた男性が滑落して亡くなりました。 警察によりますと、２９日午前１１時半ごろ、消防から「登山客７人を引率するガイドとして登山中の男性が滑落した」と連絡がありました。大日向山 笹子雁ケ腹摺山 三岳山  "
      )
      assert.equal(emitList[0].keyword, "由布岳")
      // assert.equal(
      //   emitList[1].keyword,
      //   "登山" /* とざん じゃなくて のぼりやま */
      // )
      assert.equal(emitList[1].keyword, "大日向山")
      assert.equal(emitList[2].keyword, "笹子雁ケ腹摺山")
      assert.equal(emitList[3].keyword, "三岳山") // 三岳にヒットしない。えらい。
    })
  })
})
