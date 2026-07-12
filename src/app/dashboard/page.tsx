import Link from "next/link"
import { redirect } from "next/navigation"
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
import { getShopSummary } from "@/features/analytics/services/summary"
import { getCurrentUser, requireUserId } from "@/features/auth/services/session"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { getShopForUser } from "@/features/shop/services/shop"
import { cn } from "@/lib/utils"

export default async function DashboardPage() {
  const userId = await requireUserId()
  const user = await getCurrentUser()

  if (!process.env.DATABASE_URL) {
    return (
      <DashboardShell>
        <Card>
          <CardHeader>
            <CardTitle>Connect your database</CardTitle>
            <CardDescription>
              DigiShop APIs are ready. Add a Neon staging{" "}
              <code>DATABASE_URL</code> to <code>.env.local</code>, then run{" "}
              <code>pnpm db:push</code>.
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
      </DashboardShell>
    )
  }

  const shop = await getShopForUser(userId)
  if (!shop) {
    redirect(SHOP_ROUTES.onboarding)
  }

  const summary = await getShopSummary(userId, shop.id)

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{shop.name}</h1>
          <p className="text-sm text-muted-foreground">
            Public storefront:{" "}
            <Link
              href={`/shop/${shop.slug}`}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              /shop/{shop.slug}
            </Link>
            {" · "}
            API:{" "}
            <code className="text-xs">/api/shop/{shop.slug}/products</code>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Products"
            value={String(summary.productCount)}
            hint="In your catalog"
          />
          <SummaryCard
            title="Low stock"
            value={String(summary.lowStockCount)}
            hint="At or below threshold"
          />
          <SummaryCard
            title="Orders today"
            value={String(summary.todayOrderCount)}
            hint="Excluding cancelled"
          />
          <SummaryCard
            title="Revenue today"
            value={`₹${summary.todayRevenue.toFixed(2)}`}
            hint="Gross sales"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>
              Signed in as{" "}
              <span className="font-medium text-foreground">
                {user?.primaryEmailAddress?.emailAddress ?? user?.username}
              </span>
              . Inventory, POS, and orders APIs are available via Server Actions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to home
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}

function SummaryCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-numeric text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
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
        {children}
      </main>
    </div>
  )
}
