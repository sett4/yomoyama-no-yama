import * as csv from "fast-csv"
import { ReadStream } from "fs"
import axios from "axios"
import { Readable } from "stream"
import { getHeapSnapshot } from "v8"
import * as admin from "firebase-admin"
import _ from "lodash"
import { ValueObject } from "../../../value-object"
import crypto from "crypto"

class IndexValueObject {
  path: string
  updatedAt: string
  size: number
  md5sum: string
  type: string

  constructor(
    type: string,
    path: string,
    updatedAt: string,
    size: number,
    md5sum: string
  ) {
    this.type = type
    this.path = path
    this.updatedAt = updatedAt
    this.size = size
    this.md5sum = md5sum
  }
}

export class IndexImporter {
  db: admin.firestore.Firestore
  type: string

  readonly COLLECTION_ARTICLE: string = "mountain-raw/gsi/"

  constructor(type: string, firestore: admin.firestore.Firestore) {
    this.db = firestore
    this.type = type
  }

  importIndex(stream: Readable): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      csv
        .fromStream(stream)
        .on("data", (data: any[]) => {
          const v = new IndexValueObject(
            this.type,
            data[0],
            data[1],
            Number.parseInt(data[2]),
            data[3]
          )
          this.storeIndex(v)
        })
        .on("end", () => {
          resolve()
        })
        .on("error", err => {
          reject(err)
        })
    })
  }

  async storeIndex(d: IndexValueObject) {
    console.info(d)
    await this.db
      .collection(this.getIndexCollectionName())
      .doc(this.path2Docid(d.path))
      .set({
        path: d.path,
        updatedAt: d.updatedAt,
        size: d.size,
        md5sum: d.md5sum,
      })
  }

  private getIndexCollectionName(): string {
    return this.COLLECTION_ARTICLE + this.type + "-index"
  }

  fetch(path: string): Promise<any> {
    const url = this.buildUrl(path)
    console.info(`fetching ${url}`)
    return axios
      .get(url)
      .then(response => {
        return response.data
      })
      .catch(error => {
        console.error(`cannot fetch ${url}`)
        throw error
      })
  }

  async storeContent(path: string) {
    const content = await this.fetch(path)
    await this.db
      .collection(this.COLLECTION_ARTICLE + this.type)
      .doc(this.path2Docid(path))
      .set(content)
    console.info(`stored ${path}`)
  }

  async updateAllContent() {
    const indexDocList = await this.db
      .collection(this.getIndexCollectionName())
      .get()

    const sleep = (msec: number) =>
      new Promise(resolve => setTimeout(resolve, msec))

    console.info(`list finished. ${indexDocList.size} docs`)
    let i = 0
    for (let doc of indexDocList.docs) {
      await sleep(100)
      await this.storeContent(doc.data().path)
    }

    return indexDocList.size
  }

  path2Docid(path: string): string {
    return path.split("/").join("__")
  }

  buildUrl(path: string): string {
    return `https://maps.gsi.go.jp/xyz/${this.type}/${path}`
  }

  async updateAllMountain() {
    const indexDocList = await this.db
      .collection(this.COLLECTION_ARTICLE + this.type)
      .get()

    let i = 0
    for (let doc of indexDocList.docs) {
      const mt = await this.storeMountain(doc.id, doc.data())
      if (i % 100 == 0) {
        console.info(`processing ${i} places`)
        console.info(`sample ${mt.props}`)
      }
      i++
    }
  }

  async storeMountain(id: string, data: FirebaseFirestore.DocumentData) {
    for (let feature of data.features) {
      const mt = new Mountain({
        sourceType: this.type,
        sourcePath: id.split("__").join("/"),
        long: feature.geometry.coordinates[0],
        lat: feature.geometry.coordinates[1],

        klass: feature.properties.class,
        type: feature.properties.type,
        name: feature.properties.name,
        kana: feature.properties.kana,
        rj: feature.properties.rj,
        aname: feature.properties.Aname,
        akana: feature.properties.Akana,
        arj: feature.properties.Arj,
        lfSpanFr: feature.properties.lfSpanFr,
      })

      const md5hash = crypto.createHash("sha1")
      md5hash.update(mt.props.long.toString(), "utf8")
      md5hash.update(mt.props.lat.toString(), "utf8")
      md5hash.update(mt.props.name.toString(), "utf8")
      const docid = md5hash.digest("hex")
      await this.db
        .collection(this.COLLECTION_ARTICLE + this.type + "-test")
        .doc(docid)
        .set(mt.props)

      return mt
    }
  }
}

interface PointOfPlaceProps {
  sourceType: string
  sourcePath: string
  lat: number
  long: number
  klass: string
  type: string
  name: string
  kana: string
  rj: string
  aname: string
  akana: string
  arj: string
  lfSpanFr: string
}

export class Mountain extends ValueObject<PointOfPlaceProps> {
  constructor(props: PointOfPlaceProps) {
    super(props)
  }
}
