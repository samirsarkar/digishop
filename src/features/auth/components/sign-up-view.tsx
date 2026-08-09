"use client"

import { SignUp } from "@clerk/nextjs"

import { AUTH_ROUTES } from "@/features/auth/constants"

export function SignUpView() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <SignUp
          routing="path"
          path={AUTH_ROUTES.signUp}
          forceRedirectUrl={AUTH_ROUTES.afterSignUp}
          fallbackRedirectUrl={AUTH_ROUTES.afterSignUp}
          signInUrl={AUTH_ROUTES.signIn}
          fallback={
            <div className="flex min-h-80 items-center justify-center rounded-xl border bg-card p-8 text-sm text-muted-foreground">
              Loading sign-up…
            </div>
          }
        />
      </div>
    </div>
  )
}
