"use client"

import Link from "next/link"
import { Show, UserButton } from "@clerk/nextjs"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AUTH_ROUTES } from "@/features/auth/constants"

export function AuthHeaderControls() {
  return (
    <div className="flex items-center gap-2">
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
        <UserButton />
      </Show>
    </div>
  )
}
