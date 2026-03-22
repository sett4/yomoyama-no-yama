import { createDbClient } from "./client"
import { applyMigrations } from "./migrations"

async function main() {
  const { client } = createDbClient()
  await applyMigrations(client)
  client.close()
}

main().catch(async (error) => {
  console.error(error)
  process.exit(1)
})
