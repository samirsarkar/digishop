"use client"

import { SignIn } from "@clerk/nextjs"

import { AUTH_ROUTES } from "@/features/auth/constants"

export function SignInView() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <SignIn
          routing="path"
          path={AUTH_ROUTES.signIn}
          forceRedirectUrl={AUTH_ROUTES.afterSignIn}
          fallbackRedirectUrl={AUTH_ROUTES.afterSignIn}
          signUpUrl={AUTH_ROUTES.signUp}
          fallback={
            <div className="flex min-h-80 items-center justify-center rounded-xl border bg-card p-8 text-sm text-muted-foreground">
              Loading sign-in…
            </div>
          }
        />
      </div>
    </div>
  )
}
