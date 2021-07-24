const PORT = Number(process.env.PORT) || 8080
import express from "express"
import * as admin from "firebase-admin"
import httphandler from "./httphandler"
import { useCloudLoggingBunyan, log } from "./logger"

async function startServer() {
  const app = express()
  await useCloudLoggingBunyan(app)

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
  const firestore = admin.firestore()

  httphandler.registerHandler(app, firestore)

  app.listen(PORT, () => {
    log.info(`App listening on port ${PORT}`)
  })
}

startServer()
