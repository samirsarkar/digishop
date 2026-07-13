import { SignUp } from "@clerk/nextjs"

import { AUTH_ROUTES } from "@/features/auth/constants"

export function SignUpView() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <SignUp
        forceRedirectUrl={AUTH_ROUTES.afterSignUp}
        fallbackRedirectUrl={AUTH_ROUTES.afterSignUp}
        signInUrl={AUTH_ROUTES.signIn}
      />
    </div>
  )
}
