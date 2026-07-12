export class AppError extends Error {
  readonly code: string
  readonly status: number

  constructor(message: string, code = "APP_ERROR", status = 400) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.status = status
  }
}

export type ActionSuccess<T> = { ok: true; data: T }
export type ActionFailure = { ok: false; error: { code: string; message: string } }
export type ActionResult<T> = ActionSuccess<T> | ActionFailure

export function ok<T>(data: T): ActionSuccess<T> {
  return { ok: true, data }
}

export function fail(error: unknown): ActionFailure {
  if (error instanceof AppError) {
    return {
      ok: false,
      error: { code: error.code, message: error.message },
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "ZodError" &&
    "issues" in error &&
    Array.isArray((error as { issues: unknown[] }).issues)
  ) {
    const issue = (error as { issues: Array<{ message?: string }> }).issues[0]
    return {
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: issue?.message ?? "Invalid input",
      },
    }
  }

  if (error instanceof Error) {
    return {
      ok: false,
      error: { code: "INTERNAL_ERROR", message: error.message },
    }
  }

  return {
    ok: false,
    error: { code: "INTERNAL_ERROR", message: "Something went wrong" },
  }
}

export async function toActionResult<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    return ok(await fn())
  } catch (error) {
    return fail(error)
  }
}
