import { Logger } from "@google-cloud/logging-bunyan/build/src/middleware/express"
import axios from "axios"
import { Express } from "express"

const registerHandler = function(
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  async function notifyToNetlify(logger: Logger): Promise<void> {
    if (process.env.NETLIFY_HOOK_URL) {
      const hookUrl: string = process.env.NETLIFY_HOOK_URL
      await axios.post(hookUrl, {})
      logger.info(`nofity to netlify ${hookUrl}`)
    } else {
      logger.info(
        "netlify rebuild hook skipped. due to process.env.NETLIFY_HOOK_URL is empty."
      )
    }
    return
  }

  app.get("/generate", async (req, res) => {
    await notifyToNetlify(req.log)
    res.send("UPDATED")
  })
}

export { registerHandler }
