import type { Config } from "drizzle-kit"

const databaseUrl = process.env.DATABASE_URL || "file:./local.db"

export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  },
} satisfies Config
