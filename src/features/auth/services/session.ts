import { auth, currentUser } from "@clerk/nextjs/server"

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
