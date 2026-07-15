import { auth, currentUser } from "@clerk/nextjs/server"

import { AppError } from "@/shared/lib/errors"

export async function getSession() {
  return auth()
}

export async function getCurrentUser() {
  return currentUser()
}

export async function requireUserId() {
  const { userId } = await auth.protect()
  return userId
}

/** For route handlers: 401 JSON-friendly error instead of a redirect. */
export async function requireApiUserId() {
  const { userId } = await auth()
  if (!userId) {
    throw new AppError("Sign in required", "UNAUTHORIZED", 401)
  }
  return userId
}
