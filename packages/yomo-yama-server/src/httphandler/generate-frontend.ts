import axios from "axios"
import { Express } from "express"
import { getLogger } from "../logger"

const registerHandler = async function (
  app: Express,
  firestore: FirebaseFirestore.Firestore
) {
  async function notifyToNetlify(): Promise<void> {
    if (process.env.NETLIFY_HOOK_URL) {
      const hookUrl: string = process.env.NETLIFY_HOOK_URL
      await axios.post(hookUrl, {})
      getLogger().info(`call build hook ${hookUrl}`)
    } else {
      getLogger().info(
        "calling build hook skipped. due to process.env.NETLIFY_HOOK_URL is empty."
      )
    }
    return
  }

  app.get("/generate", async (req, res) => {
    await notifyToNetlify()
    res.send("UPDATED")
  })
}

export { registerHandler }
