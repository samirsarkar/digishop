"use client"

import Link from "next/link"
import { Show, UserButton, useAuth } from "@clerk/nextjs"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AUTH_ROUTES } from "@/features/auth/constants"

export function AuthHeaderControls() {
  const { isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <div
        className="size-8 shrink-0 animate-pulse rounded-full bg-muted"
        aria-hidden
      />
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Show when="signed-out">
        <Link
          href={AUTH_ROUTES.signIn}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Sign in
        </Link>
        <Link
          href={AUTH_ROUTES.signUp}
          className={cn(buttonVariants({ size: "sm" }))}
        >
          Get Started
        </Link>
      </Show>
      <Show when="signed-in">
        <Link
          href={AUTH_ROUTES.dashboard}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          Dashboard
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </Show>
    </div>
  )
}
