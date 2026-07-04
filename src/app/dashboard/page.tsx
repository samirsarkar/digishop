import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { Smartphone } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AUTH_ROUTES } from "@/features/auth/constants"
import { getCurrentUser } from "@/features/auth/services/session"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Smartphone className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">DigiShop</span>
          </Link>
          <UserButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Your merchant dashboard will live here — inventory, checkout, and
              analytics.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Signed in as{" "}
              <span className="font-medium text-foreground">
                {user?.primaryEmailAddress?.emailAddress ?? user?.username}
              </span>
            </p>
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Back to home
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
