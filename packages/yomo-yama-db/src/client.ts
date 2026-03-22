import { createClient } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import * as schema from "./schema"

export type DbClient = LibSQLDatabase<typeof schema>

export function resolveDatabaseUrl(): string {
  return process.env.DATABASE_URL || "file:./local.db"
}

function describeDatabaseTarget(url: string) {
  if (url.startsWith("file:")) {
    return { scheme: "file", target: url.slice("file:".length) || "." }
  }

  try {
    const parsed = new URL(url)
    return {
      scheme: parsed.protocol.replace(":", ""),
      target: parsed.host,
    }
  } catch (_error) {
    return { scheme: "unknown", target: "unparseable" }
  }
}

export function createDbClient(
  url: string = resolveDatabaseUrl(),
  authToken: string | undefined = process.env.DATABASE_AUTH_TOKEN
) {
  const target = describeDatabaseTarget(url)
  console.info("[db] createDbClient", {
    scheme: target.scheme,
    target: target.target,
    hasAuthToken: Boolean(authToken),
    nodeEnv: process.env.NODE_ENV || "undefined",
  })
  const client = createClient({ url, authToken })
  const db = drizzle(client, { schema })
  return { client, db }
}
