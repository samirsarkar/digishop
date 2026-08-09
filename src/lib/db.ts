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

function collectErrorText(error: unknown, depth = 0): string {
  if (depth > 4 || error == null) return ""
  if (typeof error === "string") return error
  if (!(error instanceof Error)) return String(error)
  const cause =
    "cause" in error && error.cause != null
      ? ` ${collectErrorText(error.cause, depth + 1)}`
      : ""
  return `${error.message}${cause}`
}

function isTransientDbError(error: unknown): boolean {
  return /fetch failed|connecting to database|ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up|network/i.test(
    collectErrorText(error)
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Retry Neon HTTP queries on transient network / cold-start failures.
 */
export async function withDbRetry<T>(
  fn: () => Promise<T>,
  attempts = 3
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      if (!isTransientDbError(error) || attempt === attempts - 1) {
        throw error
      }
      await sleep(400 * (attempt + 1))
    }
  }
  throw lastError
}

export { schema }
