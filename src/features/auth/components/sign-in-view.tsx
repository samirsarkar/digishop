import { SignIn } from "@clerk/nextjs"

import { AUTH_ROUTES } from "@/features/auth/constants"

export function SignInView() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <SignIn
        forceRedirectUrl={AUTH_ROUTES.afterSignIn}
        fallbackRedirectUrl={AUTH_ROUTES.afterSignIn}
        signUpUrl={AUTH_ROUTES.signUp}
      />
    </div>
  )
}
