import { and, asc, count, desc, eq, gte, sql } from "drizzle-orm"

import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import { inventory, orders, products } from "@/lib/db/schema"

export type LowStockProduct = {
  id: string
  name: string
  quantity: number
  lowStockThreshold: number
  price: string
}

export type RecentOrder = {
  id: string
  totalAmount: string
  paymentMethod: string
  status: string
  createdAt: Date
}

export type DayRevenue = {
  date: string
  revenue: number
  orderCount: number
}

export type ShopSummary = {
  productCount: number
  lowStockCount: number
  todayOrderCount: number
  todayRevenue: number
  weekOrderCount: number
  weekRevenue: number
  totalUnits: number
  inventoryRetailValue: number
  lowStockProducts: LowStockProduct[]
  recentOrders: RecentOrder[]
  last7Days: DayRevenue[]
}

function startOfLocalDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export async function getShopSummary(
  userId: string,
  shopId: string
): Promise<ShopSummary> {
  await assertShopAccess(userId, shopId)
  const db = getDb()

  const todayStart = startOfLocalDay()
  const weekStart = startOfLocalDay()
  weekStart.setDate(weekStart.getDate() - 6)

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

  const [unitsRow] = await db
    .select({
      units: sql<string>`coalesce(sum(${inventory.quantity}), 0)`,
      retailValue: sql<string>`coalesce(sum(${inventory.quantity} * ${products.price}::numeric), 0)`,
    })
    .from(inventory)
    .innerJoin(products, eq(products.id, inventory.productId))
    .where(eq(inventory.shopId, shopId))

  const [todayRow] = await db
    .select({
      orderCount: count(),
      revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.shopId, shopId),
        gte(orders.createdAt, todayStart),
        sql`${orders.status} <> 'cancelled'`
      )
    )

  const [weekRow] = await db
    .select({
      orderCount: count(),
      revenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.shopId, shopId),
        gte(orders.createdAt, weekStart),
        sql`${orders.status} <> 'cancelled'`
      )
    )

  const lowStockProducts = await db
    .select({
      id: products.id,
      name: products.name,
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold,
      price: products.price,
    })
    .from(inventory)
    .innerJoin(products, eq(products.id, inventory.productId))
    .where(
      and(
        eq(inventory.shopId, shopId),
        sql`${inventory.quantity} <= ${inventory.lowStockThreshold}`
      )
    )
    .orderBy(asc(inventory.quantity))
    .limit(8)

  const recentOrders = await db
    .select({
      id: orders.id,
      totalAmount: orders.totalAmount,
      paymentMethod: orders.paymentMethod,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.shopId, shopId))
    .orderBy(desc(orders.createdAt))
    .limit(5)

  const weekOrders = await db
    .select({
      totalAmount: orders.totalAmount,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(
      and(
        eq(orders.shopId, shopId),
        gte(orders.createdAt, weekStart),
        sql`${orders.status} <> 'cancelled'`
      )
    )

  const byDay = new Map<string, { revenue: number; orderCount: number }>()
  for (const order of weekOrders) {
    const key = formatLocalDate(order.createdAt)
    const current = byDay.get(key) ?? { revenue: 0, orderCount: 0 }
    current.revenue += Number(order.totalAmount)
    current.orderCount += 1
    byDay.set(key, current)
  }

  const last7Days: DayRevenue[] = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = startOfLocalDay()
    d.setDate(d.getDate() - i)
    const key = formatLocalDate(d)
    const hit = byDay.get(key)
    last7Days.push({
      date: key,
      revenue: hit?.revenue ?? 0,
      orderCount: hit?.orderCount ?? 0,
    })
  }

  return {
    productCount: productRow?.value ?? 0,
    lowStockCount: lowStockRow?.value ?? 0,
    todayOrderCount: todayRow?.orderCount ?? 0,
    todayRevenue: Number(todayRow?.revenue ?? 0),
    weekOrderCount: weekRow?.orderCount ?? 0,
    weekRevenue: Number(weekRow?.revenue ?? 0),
    totalUnits: Number(unitsRow?.units ?? 0),
    inventoryRetailValue: Number(unitsRow?.retailValue ?? 0),
    lowStockProducts,
    recentOrders,
    last7Days,
  }
}

function formatLocalDate(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}
