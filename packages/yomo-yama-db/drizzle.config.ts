import type { Config } from "drizzle-kit"
import * as path from "path"

const localDatabaseUrl = `file:${path.resolve(__dirname, "local.db")}`
const databaseUrl = process.env.DATABASE_URL || localDatabaseUrl

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config
