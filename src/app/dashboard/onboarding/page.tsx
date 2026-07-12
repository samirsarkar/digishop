import Link from "next/link"
import { redirect } from "next/navigation"
import { Smartphone } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getCurrentUser, requireUserId } from "@/features/auth/services/session"
import { OnboardingForm } from "@/features/shop/components/onboarding-form"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { getShopForUser } from "@/features/shop/services/shop"

export default async function OnboardingPage() {
  const userId = await requireUserId()
  const user = await getCurrentUser()

  if (!process.env.DATABASE_URL) {
    return (
      <OnboardingShell>
        <Card>
          <CardHeader>
            <CardTitle>Database not connected</CardTitle>
            <CardDescription>
              Add your Neon staging <code>DATABASE_URL</code> to{" "}
              <code>.env.local</code>, then run <code>pnpm db:push</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              See the README for staging vs production setup.
            </p>
          </CardContent>
        </Card>
      </OnboardingShell>
    )
  }

  const shop = await getShopForUser(userId)
  if (shop) {
    redirect(SHOP_ROUTES.dashboard)
  }

  return (
    <OnboardingShell>
      <Card>
        <CardHeader>
          <CardTitle>Set up your shop</CardTitle>
          <CardDescription>
            Welcome
            {user?.firstName ? `, ${user.firstName}` : ""}. Create your shop
            profile to unlock inventory, POS, and your public storefront.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OnboardingForm />
        </CardContent>
      </Card>
    </OnboardingShell>
  )
}

function OnboardingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Smartphone className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">DigiShop</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        {children}
      </main>
    </div>
  )
}
