const PORT = Number(process.env.PORT) || 8080
import express from "express"
import httphandler from "./httphandler"
import { useStructuredLogging, log } from "./logger"

async function startServer() {
  const app = express()
  useStructuredLogging(app)

  await httphandler.registerHandler(app)

  app.listen(PORT, () => {
    log.info(`App listening on port ${PORT}`)
  })
}

startServer()
