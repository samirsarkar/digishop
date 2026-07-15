import { NextResponse } from "next/server"
import { ZodError } from "zod"

import { AppError } from "@/shared/lib/errors"
import { appLogger } from "@/shared/lib/logger"

export function apiError(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status })
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return apiError(error.code, error.message, error.status)
  }

  if (error instanceof ZodError) {
    const issue = error.issues[0]
    return apiError("VALIDATION_ERROR", issue?.message ?? "Invalid input", 422)
  }

  appLogger.error("API route failed", error)
  return apiError("INTERNAL_ERROR", "Something went wrong", 500)
}

export function requireDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new AppError(
      "DATABASE_URL is not set",
      "DATABASE_NOT_CONFIGURED",
      503
    )
  }
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    throw new AppError("Request body must be valid JSON", "INVALID_JSON", 400)
  }
}

export function getQueryParams(request: Request): Record<string, string> {
  return Object.fromEntries(new URL(request.url).searchParams)
}
