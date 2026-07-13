type LogContext = Record<string, unknown>

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause:
        error.cause instanceof Error
          ? { name: error.cause.name, message: error.cause.message }
          : error.cause,
    }
  }

  return { message: String(error) }
}

/**
 * Structured app logger — console for now; swap sink later (Sentry / AI triage).
 */
export const appLogger = {
  info(message: string, context?: LogContext) {
    console.info("[digishop]", message, context ?? {})
  },
  warn(message: string, context?: LogContext) {
    console.warn("[digishop]", message, context ?? {})
  },
  error(message: string, error?: unknown, context?: LogContext) {
    console.error("[digishop]", message, {
      ...context,
      error: error ? serializeError(error) : undefined,
      at: new Date().toISOString(),
    })
  },
}
