import { createClient } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import * as schema from "./schema"

export type DbClient = LibSQLDatabase<typeof schema>

export function resolveDatabaseUrl(): string {
  return process.env.DATABASE_URL || "file:./local.db"
}

export function createDbClient(
  url: string = resolveDatabaseUrl(),
  authToken: string | undefined = process.env.DATABASE_AUTH_TOKEN
) {
  const client = createClient({ url, authToken })
  const db = drizzle(client, { schema })
  return { client, db }
}
