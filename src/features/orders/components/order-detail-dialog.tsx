"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  getOrderStatusLabel,
  type OrderStatus,
} from "@/features/orders/constants"
import {
  getOrderDetailAction,
  updateOrderStatusAction,
} from "@/features/orders/services/actions"
import type { OrderDetail } from "@/features/orders/services/orders"
import { formatInr } from "@/shared/lib/money"

function statusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  if (status === ORDER_STATUS.PENDING) return "default"
  if (status === ORDER_STATUS.CANCELLED) return "destructive"
  if (status === ORDER_STATUS.COMPLETED) return "secondary"
  return "outline"
}

export function OrderDetailDialog({
  orderId,
  open,
  onClose,
}: {
  orderId: string | null
  open: boolean
  onClose: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [detail, setDetail] = useState<OrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !orderId) return
    let cancelled = false
    startTransition(async () => {
      const result = await getOrderDetailAction(orderId)
      if (cancelled) return
      if (!result.ok) {
        setError(result.error.message)
        setDetail(null)
        return
      }
      setError(null)
      setDetail(result.data)
    })
    return () => {
      cancelled = true
    }
  }, [open, orderId])

  if (!open) return null

  const display = detail && detail.id === orderId ? detail : null

  const canAct =
    display &&
    display.status !== ORDER_STATUS.CANCELLED &&
    display.status !== ORDER_STATUS.COMPLETED

  function setStatus(status: OrderStatus) {
    if (!display) return
    setError(null)
    startTransition(async () => {
      const result = await updateOrderStatusAction({
        orderId: display.id,
        status,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      const refreshed = await getOrderDetailAction(display.id)
      if (refreshed.ok) setDetail(refreshed.data)
      router.refresh()
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-detail-title"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border bg-background shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between border-b bg-background px-4 py-3">
          <h2 id="order-detail-title" className="font-semibold">
            Order details
          </h2>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-5 p-4">
          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {pending && !display ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : null}
          {display ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {display.pickupCode ? (
                  <span className="font-numeric rounded-md bg-muted px-2 py-0.5 text-sm font-semibold tracking-wider">
                    {display.pickupCode}
                  </span>
                ) : null}
                <Badge variant={statusVariant(display.status)}>
                  {getOrderStatusLabel(display.status)}
                </Badge>
                <span className="text-xs text-muted-foreground uppercase">
                  {display.paymentMethod}
                </span>
              </div>

              <div className="space-y-1 text-sm">
                <p className="font-numeric text-lg font-semibold">
                  {formatInr(display.totalAmount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(display.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
                {display.notes ? (
                  <p className="text-muted-foreground">{display.notes}</p>
                ) : null}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">Items</h3>
                <ul className="divide-y rounded-lg border text-sm">
                  {display.items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <span className="min-w-0 truncate">
                        {item.productName} × {item.quantity}
                      </span>
                      <span className="font-numeric shrink-0">
                        {formatInr(Number(item.unitPrice) * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
                {display.charges.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm">
                    {display.charges.map((charge) => (
                      <li
                        key={charge.id}
                        className="flex justify-between text-muted-foreground"
                      >
                        <span>{charge.label}</span>
                        <span className="font-numeric">
                          {formatInr(charge.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              <div>
                <h3 className="mb-2 text-sm font-medium">History</h3>
                {display.events.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No history recorded yet for older orders.
                  </p>
                ) : (
                  <ol className="space-y-3 border-l-2 border-muted pl-4">
                    {display.events.map((event) => (
                      <li key={event.id} className="relative text-sm">
                        <span className="absolute top-1.5 -left-[1.35rem] size-2.5 rounded-full bg-primary" />
                        <p className="font-medium">{event.actorLabel}</p>
                        <p className="text-muted-foreground">
                          {event.message ??
                            (event.toStatus
                              ? getOrderStatusLabel(event.toStatus)
                              : event.eventType)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.createdAt).toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </div>

              {canAct ? (
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {display.status === ORDER_STATUS.PENDING ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={pending}
                      onClick={() => setStatus(ORDER_STATUS.CONFIRMED)}
                    >
                      Confirm
                    </Button>
                  ) : null}
                  {(
                    [
                      ORDER_STATUS.CONFIRMED,
                      ORDER_STATUS.READY,
                      ORDER_STATUS.COMPLETED,
                    ] as const
                  ).map((status) => (
                    <Button
                      key={status}
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={pending || display.status === status}
                      onClick={() => setStatus(status)}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </Button>
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={pending}
                    onClick={() => setStatus(ORDER_STATUS.CANCELLED)}
                  >
                    Cancel order
                  </Button>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
