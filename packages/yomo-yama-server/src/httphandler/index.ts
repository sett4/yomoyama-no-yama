import { registerHandler as registerMountainIncidentHandler } from "./datasource-mountain-incident"
import { registerHandler as registerGenerateFrontend } from "./generate-frontend"
import { Express } from "express"

const registerHandler = async function (app: Express) {
  await registerMountainIncidentHandler(app)
  await registerGenerateFrontend(app)
}

export default { registerHandler }
