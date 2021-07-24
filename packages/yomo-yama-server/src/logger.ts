import bunyan from "bunyan"
import * as lb from "@google-cloud/logging-bunyan"
import { Express } from "express"

const useCloudLoggingBunyan = async function(app: Express) {
  const md = await lb.express.middleware({
    logName: "yomoyama-server",
  })
  app.use(md.mw)
}

// Creates a Bunyan Cloud Logging client
const loggingBunyan = new lb.LoggingBunyan()

const streams: bunyan.Stream[] = [loggingBunyan.stream("trace")]
if (process.env.NODE_ENV == "development") {
  streams.push({ stream: process.stdout, level: "trace" })
}
const log = bunyan.createLogger({
  name: "yomoyama-server",
  streams: streams,
})

export { useCloudLoggingBunyan, log }
