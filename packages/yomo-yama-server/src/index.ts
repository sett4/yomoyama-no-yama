const PORT = Number(process.env.PORT) || 8080
import express from "express"
import * as admin from "firebase-admin"
import httphandler from "./httphandler"
import { useCloudLogging, useClsLogging, log } from "./logger"

async function startServer() {
  const app = express()
  await useCloudLogging(app)
  await useClsLogging(app)

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
  const firestore = admin.firestore()

  await httphandler.registerHandler(app, firestore)

  app.listen(PORT, () => {
    log.info(`App listening on port ${PORT}`)
  })
}

startServer()
