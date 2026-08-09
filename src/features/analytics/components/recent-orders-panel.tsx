"use client"

import {
  OrdersList,
  type OrderListRow,
} from "@/features/orders/components/orders-list"

/** Dashboard recent orders — same list UX with link to full Orders tab. */
export function RecentOrdersPanel({
  shopId,
  orders,
}: {
  shopId: string
  orders: OrderListRow[]
}) {
  return (
    <OrdersList
      shopId={shopId}
      orders={orders}
      title="Recent orders"
      description="Confirm COD / pickup quickly. Tap an order for items and history. Revenue counts completed sales only."
      showViewAllLink
    />
  )
}
