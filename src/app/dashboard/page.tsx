import Link from "next/link"
import { redirect } from "next/navigation"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { DashboardOverview } from "@/features/analytics/components/dashboard-overview"
import { getShopSummary } from "@/features/analytics/services/summary"
import { getCurrentUser, requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { loadMerchantShop } from "@/features/shop/services/shop"
import { DbUnavailableView } from "@/shared/components/db-unavailable"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const userId = await requireUserId()
  const user = await getCurrentUser()

  if (!process.env.DATABASE_URL) {
    return (
      <MerchantShell>
        <Card>
          <CardHeader>
            <CardTitle>Connect your database</CardTitle>
            <CardDescription>
              Add a Neon staging <code>DATABASE_URL</code> to{" "}
              <code>.env.local</code>, then run <code>pnpm db:push</code>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to home
            </Link>
          </CardContent>
        </Card>
      </MerchantShell>
    )
  }

  const loaded = await loadMerchantShop(userId)
  if (loaded.status === "db_unavailable") {
    return <DbUnavailableView retryHref={SHOP_ROUTES.dashboard} />
  }
  if (loaded.status === "no_shop") {
    redirect(SHOP_ROUTES.onboarding)
  }

  const { shop } = loaded

  let summary
  try {
    summary = await getShopSummary(userId, shop.id)
  } catch {
    return <DbUnavailableView retryHref={SHOP_ROUTES.dashboard} shopName={shop.name} />
  }

  return (
    <MerchantShell shopName={shop.name}>
      <DashboardOverview
        shopId={shop.id}
        shopName={shop.name}
        shopSlug={shop.slug}
        summary={summary}
        userLabel={user?.primaryEmailAddress?.emailAddress ?? user?.username}
      />
    </MerchantShell>
  )
}
