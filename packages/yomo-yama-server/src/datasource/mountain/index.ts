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
  klass: string = "MOUNTAIN"
  name: string
  perfectures: string[] = []
  coordinates: Coordinates
  elevation: number
  alternateName: MountainName[] = []
  pronunciation: string
  dataSource: string
  note: string = ""
  constructor(
    name: string,
    pronunciation: string,
    coordinates: Coordinates,
    elevation: number,
    dataSource: string
  ) {
    this.name = name
    this.pronunciation = pronunciation
    this.coordinates = coordinates
    this.elevation = elevation
    this.dataSource = dataSource
  }

  getId() {
    return this.name + "-" + this.perfectures.sort().join("-")
  }

  toData(): any {
    return {
      klass: this.klass,
      name: this.name,
      perfectures: this.perfectures.reduceRight(
        (acc: { [key: string]: boolean }, v: string) => {
          acc[v] = true
          return acc
        },
        {}
      ),
      elevation: this.elevation,
      coordinates: this.coordinates,
      alternateNames: this.alternateName,
      pronunciation: this.pronunciation,
      dataSource: this.dataSource,
      note: this.note,
    }
  }
}

interface MountainScraper {
  load(): Promise<Mountain[]>
}

export class MountainFirebaseRepository {
  db: firebase.firestore.Firestore
  readonly COLLECTION_MOUNTAIN: string = "mountain"

  constructor(firestore: firebase.firestore.Firestore) {
    this.db = firestore
  }

  save(m: Mountain): Promise<FirebaseFirestore.WriteResult> {
    return this.db
      .collection(this.COLLECTION_MOUNTAIN)
      .doc(m.getId())
      .set(m.toData())
  }
}
