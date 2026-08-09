"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { OrderDetailDialog } from "@/features/orders/components/order-detail-dialog"
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/features/orders/constants"
import {
  findShopOrdersAction,
  updateOrderStatusAction,
} from "@/features/orders/services/actions"
import { BarcodeScannerButton } from "@/features/inventory/components/barcode-scanner-button"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

export type OrderListRow = {
  id: string
  pickupCode: string | null
  totalAmount: string
  paymentMethod: string
  status: string
  notes: string | null
  createdAt: string
}

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === ORDER_STATUS.PENDING) return "default"
  if (status === ORDER_STATUS.CANCELLED) return "destructive"
  if (status === ORDER_STATUS.COMPLETED) return "secondary"
  return "outline"
}

export function OrdersList({
  shopId,
  orders: initialOrders,
  title = "Orders",
  description = "All orders for this shop. Tap a row for full details and history.",
  showViewAllLink = false,
}: {
  shopId: string
  orders: OrderListRow[]
  title?: string
  description?: string
  showViewAllLink?: boolean
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [found, setFound] = useState<OrderListRow[] | null>(null)
  const [detailId, setDetailId] = useState<string | null>(null)

  const orders = found ?? initialOrders

  function setStatus(orderId: string, status: OrderStatus, e: React.MouseEvent) {
    e.stopPropagation()
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, status })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setFound(null)
      router.refresh()
    })
  }

  function runLookup(value: string) {
    const q = value.trim()
    if (!q) {
      setFound(null)
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await findShopOrdersAction({ shopId, query: q })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setFound(
        result.data.map((order) => ({
          id: order.id,
          pickupCode: order.pickupCode,
          totalAmount: order.totalAmount,
          paymentMethod: order.paymentMethod,
          status: order.status,
          notes: order.notes,
          createdAt:
            order.createdAt instanceof Date
              ? order.createdAt.toISOString()
              : String(order.createdAt),
        }))
      )
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {showViewAllLink ? (
            <Link
              href={SHOP_ROUTES.orders}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              View all orders
            </Link>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    runLookup(query)
                  }
                }}
                placeholder="Pickup code or phone…"
                className="flex h-9 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={pending || !query.trim()}
                onClick={() => runLookup(query)}
              >
                Find
              </Button>
              <BarcodeScannerButton
                onScan={(code) => {
                  setQuery(code)
                  runLookup(code)
                }}
              />
              {found ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setFound(null)
                    setQuery("")
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}

          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {found ? "No orders match that search." : "No orders yet."}
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {orders.map((order) => {
                const canAct =
                  order.status !== ORDER_STATUS.CANCELLED &&
                  order.status !== ORDER_STATUS.COMPLETED
                return (
                  <li key={order.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      className="flex w-full cursor-pointer flex-col gap-3 px-4 py-3 text-left text-sm hover:bg-muted/50"
                      onClick={() => setDetailId(order.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault()
                          setDetailId(order.id)
                        }
                      }}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {order.pickupCode ? (
                              <span className="font-numeric rounded-md bg-muted px-2 py-0.5 text-xs font-semibold tracking-wider">
                                {order.pickupCode}
                              </span>
                            ) : null}
                            <Badge variant={statusVariant(order.status)}>
                              {ORDER_STATUS_LABELS[
                                order.status as OrderStatus
                              ] ?? order.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground uppercase">
                              {order.paymentMethod}
                            </span>
                          </div>
                          {order.notes ? (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {order.notes}
                            </p>
                          ) : null}
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString("en-IN", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                        <p className="font-numeric font-semibold">
                          {formatInr(Number(order.totalAmount))}
                        </p>
                      </div>
                      {canAct ? (
                        <div
                          className="flex flex-wrap gap-2"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {order.status === ORDER_STATUS.PENDING ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={pending}
                              onClick={(e) =>
                                setStatus(order.id, ORDER_STATUS.CONFIRMED, e)
                              }
                            >
                              Confirm
                            </Button>
                          ) : null}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={pending}
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetailId(order.id)
                            }}
                          >
                            Details
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            disabled={pending}
                            onClick={(e) =>
                              setStatus(order.id, ORDER_STATUS.CANCELLED, e)
                            }
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Tap for details & history
                        </span>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <OrderDetailDialog
        orderId={detailId}
        open={Boolean(detailId)}
        onClose={() => setDetailId(null)}
      />
    </>
  )
}
