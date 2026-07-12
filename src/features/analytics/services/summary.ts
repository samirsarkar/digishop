import { and, count, eq, gte, sql } from "drizzle-orm"

import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import { inventory, orders, products } from "@/lib/db/schema"

export type ShopSummary = {
  productCount: number
  lowStockCount: number
  todayOrderCount: number
  todayRevenue: number
}

export async function getShopSummary(
  userId: string,
  shopId: string
): Promise<ShopSummary> {
  await assertShopAccess(userId, shopId)
  const db = getDb()

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [productRow] = await db
    .select({ value: count() })
    .from(products)
    .where(eq(products.shopId, shopId))

  const [lowStockRow] = await db
    .select({ value: count() })
    .from(inventory)
    .where(
      and(
        eq(inventory.shopId, shopId),
        sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`
      )
    )

  const [todayRow] = await db
    .select({
      orderCount: count(),
      revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.shopId, shopId),
        gte(orders.createdAt, startOfDay),
        sql`${orders.status} <> 'cancelled'`
      )
    )

  return {
    productCount: productRow?.value ?? 0,
    lowStockCount: lowStockRow?.value ?? 0,
    todayOrderCount: todayRow?.orderCount ?? 0,
    todayRevenue: Number(todayRow?.revenue ?? 0),
  }
}
