import Link from "next/link"
import { Package, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ShopSummary } from "@/features/analytics/services/summary"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

function dayLabel(isoDate: string) {
  const d = new Date(`${isoDate}T12:00:00`)
  return d.toLocaleDateString("en-IN", { weekday: "short" })
}

export function DashboardOverview({
  shopName,
  shopSlug,
  summary,
  userLabel,
}: {
  shopName: string
  shopSlug: string
  summary: ShopSummary
  userLabel?: string | null
}) {
  const maxRevenue = Math.max(...summary.last7Days.map((d) => d.revenue), 1)

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{shopName}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {userLabel ? `Signed in as ${userLabel} · ` : null}
            Storefront{" "}
            <code className="text-xs">/shop/{shopSlug}</code>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={SHOP_ROUTES.addProduct}
            className={cn(buttonVariants({ size: "default" }))}
          >
            <Package className="size-4" />
            Add product
          </Link>
          <Link
            href={SHOP_ROUTES.inventory}
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            View products
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href={SHOP_ROUTES.inventory} className="block transition-opacity hover:opacity-90">
          <MetricCard
            title="Products"
            value={String(summary.productCount)}
            hint="Tap to open catalog"
          />
        </Link>
        <MetricCard
          title="Stock units"
          value={String(summary.totalUnits)}
          hint={`Value ${formatInr(summary.inventoryRetailValue)}`}
        />
        <MetricCard
          title="Today"
          value={formatInr(summary.todayRevenue)}
          hint={`${summary.todayOrderCount} order${summary.todayOrderCount === 1 ? "" : "s"}`}
        />
        <MetricCard
          title="Last 7 days"
          value={formatInr(summary.weekRevenue)}
          hint={`${summary.weekOrderCount} order${summary.weekOrderCount === 1 ? "" : "s"}`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-4" />
              Revenue — last 7 days
            </CardTitle>
            <CardDescription>Daily gross sales (excluding cancelled)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-40 items-end gap-2">
              {summary.last7Days.map((day) => {
                const height = Math.max((day.revenue / maxRevenue) * 100, day.revenue > 0 ? 8 : 2)
                return (
                  <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                    <span className="font-numeric text-[10px] text-muted-foreground">
                      {day.revenue > 0 ? formatInr(day.revenue) : "—"}
                    </span>
                    <div className="flex w-full flex-1 items-end">
                      <div
                        className="w-full rounded-t-md bg-primary/80"
                        style={{ height: `${height}%` }}
                        title={`${day.date}: ${formatInr(day.revenue)}`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{dayLabel(day.date)}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
            <CardDescription>
              {summary.lowStockCount === 0
                ? "All items above threshold"
                : `${summary.lowStockCount} item${summary.lowStockCount === 1 ? "" : "s"} need attention`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {summary.lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No low-stock alerts.</p>
            ) : (
              <ul className="space-y-3">
                {summary.lowStockProducts.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Alert at {item.lowStockThreshold}
                      </p>
                    </div>
                    <Badge variant="destructive">{item.quantity} left</Badge>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href={SHOP_ROUTES.inventory}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            >
              Restock in products
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent orders</CardTitle>
          <CardDescription>Latest sales recorded for this shop</CardDescription>
        </CardHeader>
        <CardContent>
          {summary.recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No orders yet. Add products, then record sales from POS (coming next) or
              the cash-sale API.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {summary.recentOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium capitalize">{order.status}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.paymentMethod} ·{" "}
                      {order.createdAt.toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <p className="font-numeric font-medium">
                    {formatInr(Number(order.totalAmount))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {summary.productCount === 0 ? (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle>Add your first products</CardTitle>
            <CardDescription>
              Your shop is ready. Build the catalog so analytics and the public
              storefront have something to show.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={SHOP_ROUTES.addProduct} className={cn(buttonVariants())}>
              Add your first product
            </Link>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function MetricCard({
  title,
  value,
  hint,
}: {
  title: string
  value: string
  hint: string
}) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="font-numeric text-2xl sm:text-3xl">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  )
}
