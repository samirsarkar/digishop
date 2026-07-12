import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@/lib/db/schema"

function createDb() {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon staging connection string to .env.local (see README)."
    )
  }

  const sql = neon(url)
  return drizzle(sql, { schema })
}

export type Db = ReturnType<typeof createDb>

let cached: Db | null = null

/** Lazy Drizzle client — throws a clear error when DATABASE_URL is missing. */
export function getDb(): Db {
  if (!cached) {
    cached = createDb()
  }
  return cached
}

export { schema }
