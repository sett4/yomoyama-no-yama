import winston, { Logger } from "winston"
import * as lw from "@google-cloud/logging-winston"
import { Express, Request, RequestHandler, Response } from "express"
import { createNamespace } from "cls-hooked"

const isCloudLoggingEnabled = process.env.NODE_ENV !== "development"
const loggingWinston = isCloudLoggingEnabled
  ? new lw.LoggingWinston()
  : null

const log = winston.createLogger({
  level: "debug",
  transports: [
    new winston.transports.Console(),
    // Add Cloud Logging
    ...(loggingWinston ? [loggingWinston] : []),
  ] as winston.transport[],
})

const applicationNamespace = createNamespace("app-log-ctx")
const useClsLogging = function(app: Express) {
  const attachContext: RequestHandler = (req, res, next) => {
    applicationNamespace.run(() => next())
  }

  const setLogger: RequestHandler = (req, res, next) => {
    applicationNamespace.set("LOGGER", req.log)

    next()
  }

  app.use(attachContext, setLogger)
}

const getLogger = (): Logger => {
  return applicationNamespace.get("LOGGER") || log
}

const useCloudLogging = async function(app: Express) {
  if (!isCloudLoggingEnabled) return

  const mw = await lw.express.makeMiddleware(log)

  app.use(mw)
}

export { useCloudLogging, log, useClsLogging, getLogger }
