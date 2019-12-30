import fs from "fs"
import path from "path"
import csv from "fast-csv"
const proj4 = require("proj4")
import * as firebase from "firebase-admin"

export type MountainName = {
  name: string
  pronunciation: string
}

export type Coordinates = {
  lat: number
  long: number
}

export class Mountain {
  klass: string = "mountain"
  name: string
  perfectures: string[] = []
  elevation: number
  position: Coordinates
  alterneName: MountainName[] = []
  pronunciation: string
  dataSource: string
  constructor(
    name: string,
    pronunciation: string,
    position: Coordinates,
    elevation: number,
    dataSource: string
  ) {
    this.name = name
    this.pronunciation = pronunciation
    this.position = position
    this.elevation = elevation
    this.dataSource = dataSource
  }

  getId() {
    return this.name + "-" + this.perfectures.join("-")
  }
}

interface MountainScraper {
  load(): Promise<Mountain[]>
}

export class Yamdat14Scraper {
  constructor() {
    proj4.defs([
      [
        "EPSG:4301", //東京測地系/日本測地系 SRID=4301
        "+proj=longlat +ellps=bessel +towgs84=-146.414,507.337,680.507,0,0,0,0 +no_defs",
      ],
    ])
  }
  load(): Promise<Mountain[]> {
    return new Promise<Mountain[]>((resolve, reject) => {
      const stream = fs.createReadStream(
        path.join(__dirname, "yama.csv"),
        "utf-8"
      )
      const list: Mountain[] = []
      csv
        .fromStream(stream)
        .on("data", (data: any[]) => {
          const [long, lat] = proj4("EPSG:4301", "EPSG:4326", [
            data[15],
            data[14],
          ])
          const p: Coordinates = { lat, long }
          const m = new Mountain(data[1], data[2], p, data[5], "yamdat14")
          list.push(m)
        })
        .on("end", () => {
          resolve(list)
        })
        .on("error", err => {
          reject(err)
        })
    })
  }
}

export class MountainFirebaseRepository {
  db: firebase.firestore.Firestore
  readonly COLLECTION_MOUNTAIN: string = "placeofname/mountain"

  constructor(firestore: firebase.firestore.Firestore) {
    this.db = firestore
  }

  save(m: Mountain): Promise<FirebaseFirestore.WriteResult> {
    return this.db
      .collection(this.COLLECTION_MOUNTAIN)
      .doc(m.getId())
      .set(m)
  }
}
