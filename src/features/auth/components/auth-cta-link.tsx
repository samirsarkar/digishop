"use client"

import Link from "next/link"
import { useAuth } from "@clerk/nextjs"

import { AUTH_ROUTES } from "@/features/auth/constants"

type AuthCtaLinkProps = {
  className?: string
  children: React.ReactNode
  /** Label when signed in (defaults to children) */
  signedInLabel?: React.ReactNode
  /** Destination when signed out (default: sign-up) */
  signedOutHref?: string
  /** Destination when signed in (default: dashboard → onboarding if no shop) */
  signedInHref?: string
}

/**
 * Session-aware CTA that always renders (avoids blank buttons while Clerk loads).
 * Signed-out / loading → sign-up; signed-in → dashboard (then onboarding if needed).
 */
export function AuthCtaLink({
  className,
  children,
  signedInLabel,
  signedOutHref = AUTH_ROUTES.signUp,
  signedInHref = AUTH_ROUTES.dashboard,
}: AuthCtaLinkProps) {
  const { isLoaded, isSignedIn } = useAuth()

  if (isLoaded && isSignedIn) {
    return (
      <Link href={signedInHref} className={className}>
        {signedInLabel ?? children}
      </Link>
    )
  }

  return (
    <Link href={signedOutHref} className={className}>
      {children}
    </Link>
  )
}

export function SignedOutLink({
  href,
  className,
  children,
}: {
  href: string
  className?: string
  children: React.ReactNode
}) {
  const { isLoaded, isSignedIn } = useAuth()

  if (isLoaded && isSignedIn) {
    return null
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}
