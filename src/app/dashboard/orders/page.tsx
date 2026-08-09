import { redirect } from "next/navigation"

import { OrdersList } from "@/features/orders/components/orders-list"
import { listOrders } from "@/features/orders/services/orders"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { loadMerchantShop } from "@/features/shop/services/shop"
import { DbUnavailableView } from "@/shared/components/db-unavailable"

export default async function OrdersPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const loaded = await loadMerchantShop(userId)
  if (loaded.status === "db_unavailable") {
    return <DbUnavailableView retryHref={SHOP_ROUTES.orders} />
  }
  if (loaded.status === "no_shop") {
    redirect(SHOP_ROUTES.onboarding)
  }

  const { shop } = loaded

  let orders
  try {
    orders = await listOrders(userId, shop.id)
  } catch {
    return (
      <DbUnavailableView retryHref={SHOP_ROUTES.orders} shopName={shop.name} />
    )
  }

  return (
    <MerchantShell shopName={shop.name}>
      <OrdersList
        shopId={shop.id}
        orders={orders.map((order) => ({
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
        }))}
        title="All orders"
        description="Every order placed to date. Open any row for items, customer info, and full history. Orders cannot be deleted."
      />
    </MerchantShell>
  )
}
