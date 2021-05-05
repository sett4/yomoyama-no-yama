import { registerHandler as registerMountainIncidentHandler } from "./datasource-mountain-incident"
import { registerHandler as registerMountainGsiHandler } from "./datasource-mountain-gsi"
import { registerHandler as registerGenerateFrontend } from "./generate-frontend"
import { Express } from "express"

const registerHandler = function(
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  registerMountainGsiHandler(app, firestore)
  registerMountainIncidentHandler(app, firestore)
  registerGenerateFrontend(app, firestore)
}

export default { registerHandler }
