import { Express } from "express"
import fs from "fs"
import zlib from "zlib"
import { IndexImporter } from "../datasource/mountain/gsi/convert2db"

const registerHandler = async function(
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  app.get("/datasource/mountain/gsi/index", async (req, res) => {
    const stream = fs
      .createReadStream("data/mokuroku-experimental_nnfpt.csv.gz")
      .pipe(zlib.createGunzip())

    const importer = new IndexImporter("experimental_nnfpt", firestore)
    await importer.importIndex(stream)
    res.send("OK")
  })
  app.get("/datasource/mountain/gsi/update-raw", async (req, res) => {
    const importer = new IndexImporter("experimental_nnfpt", firestore)
    await importer.updateAllContent()
    req.log.info("test")
    res.send("OK")
  })
  app.get("/datasource/mountain/gsi/raw-to-test", async (req, res) => {
    const importer = new IndexImporter("experimental_nnfpt", firestore)
    await importer.updateAllMountain()
    req.log.info("test")
    res.send("OK")
  })
}

export { registerHandler }
