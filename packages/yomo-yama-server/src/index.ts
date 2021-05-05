const PORT = Number(process.env.PORT) || 8080
import * as lb from "@google-cloud/logging-bunyan"
import express from "express"
import axios from "axios"
import * as admin from "firebase-admin"
import httphandler from "./httphandler"

async function startServer() {
  const app = express()
  const { logger, mw } = await lb.express.middleware({
    logName: "yomoyama-server",
  })
  app.use(mw)

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
  const firestore = admin.firestore()

  httphandler.registerHandler(app, firestore)

  app.listen(PORT, () => {
    logger.info(`App listening on port ${PORT}`)
  })
}

startServer()
