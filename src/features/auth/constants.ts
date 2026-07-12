export const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  dashboard: "/dashboard",
  afterSignIn: "/dashboard",
  afterSignUp: "/dashboard",
} as const

export const PUBLIC_ROUTES = [
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/shop(.*)",
  "/api/shop(.*)",
] as const
