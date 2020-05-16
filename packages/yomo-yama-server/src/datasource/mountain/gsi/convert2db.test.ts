process.env.FIRESTORE_EMULATOR_HOST = "localhost:7080"

import assert from "power-assert"
import * as firebase from "@firebase/testing"
import * as admin from "firebase-admin"

import fs from "fs"
import zlib from "zlib"

import { IndexImporter } from "./convert2db"

const projectId = "mt-incident"
const rules = "{}"

describe("firestore-test", () => {
  test("hoge", () => {
    assert.equal(1, 1)
  })
  // test毎にデータをクリアする
  afterEach(async () => {
    await firebase.clearFirestoreData({ projectId })
  })
  // 全テスト終了後に作成したアプリを全消去
  afterAll(async () => {
    await Promise.all(firebase.apps().map(app => app.delete()))
  })
  function adminApp() {
    return firebase.initializeAdminApp({ projectId }).firestore()
  }
  describe("目録インポートのテスト", () => {
    test("csvのパース", async () => {
      /* この回避策はダサいが、@firebase/tesingとfirebase-adminで定義が違うのが許せん */
      const db: admin.firestore.Firestore = (adminApp() as unknown) as admin.firestore.Firestore
      const stream = fs
        .createReadStream(
          "src/datasource/mountain/gsi/mokuroku-z15-head.csv.gz"
        )
        .pipe(zlib.createGunzip())

      const importer = new IndexImporter("experimental_nnfpt", db)
      await importer.importIndex(stream)
      const indexDoc = await db
        .collection(importer.COLLECTION_ARTICLE + importer.type + "-index")
        .doc("15/27573/14087.geojson")
        .get()
      console.info(indexDoc.data())

      const count = await importer.updateAllContent()
      console.info(`imported ${count}`)

      const contentDoc = await db
        .collection(importer.COLLECTION_ARTICLE + importer.type)
        .doc("15/27573/14087.geojson")
        .get()
      console.info(contentDoc.data())
    })
    //   test("messageの読み込みを実行", async () => {
    //     const db = adminApp({ uid: "testUser" })
    //     console.log("authorized")
    //     const message = db.collection("message").doc("testUser")
    //     await firebase.assertSucceeds(message.get())
    //   })
    test("messageへ書き込みを実行", async () => {
      const db = adminApp()
      const message = db.collection("message").doc("testUser")
      await firebase.assertSucceeds(message.set({ text: "test" }))
    })
  })
})
