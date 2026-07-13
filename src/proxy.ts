import { NextResponse } from "next/server"
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"

import { AUTH_ROUTES, PUBLIC_ROUTES } from "@/features/auth/constants"

const isPublicRoute = createRouteMatcher([...PUBLIC_ROUTES])
const isAuthRoute = createRouteMatcher([
  AUTH_ROUTES.signIn + "(.*)",
  AUTH_ROUTES.signUp + "(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  const { userId } = await auth()

  // Signed-in users should never stay on sign-in / sign-up
  if (userId && isAuthRoute(request)) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url))
  }

  if (!isPublicRoute(request)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
