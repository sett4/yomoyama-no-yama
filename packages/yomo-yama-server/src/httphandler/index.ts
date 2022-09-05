import { registerHandler as registerMountainIncidentHandler } from "./datasource-mountain-incident"
import { registerHandler as registerMountainGsiHandler } from "./datasource-mountain-gsi"
import { registerHandler as registerGenerateFrontend } from "./generate-frontend"
import { Express } from "express"

const registerHandler = async function(
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  await registerMountainGsiHandler(app, firestore)
  await registerMountainIncidentHandler(app, firestore)
  await registerGenerateFrontend(app, firestore)
}

export default { registerHandler }
