import { and, desc, eq, ilike, inArray, lt, or, sql } from "drizzle-orm"

import {
  generatePickupCode,
  ORDER_EVENT,
  ORDER_HOLD_STATUSES,
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/features/orders/constants"
import { recordOrderEvent } from "@/features/orders/services/order-events"
import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import {
  inventory,
  orderCharges,
  orderEvents,
  orderItems,
  orders,
  products,
  transactions,
  type Order,
  type OrderCharge,
  type OrderEvent,
  type OrderItem,
} from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import { appLogger } from "@/shared/lib/logger"
import {
  createOrderSchema,
  findOrderLookupSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type FindOrderLookupInput,
  type UpdateOrderStatusInput,
} from "@/shared/lib/validators/orders"

export type OrderWithItems = Order & { items: OrderItem[] }

export type OrderDetailItem = OrderItem & { productName: string }

export type OrderDetail = Order & {
  items: OrderDetailItem[]
  charges: OrderCharge[]
  events: OrderEvent[]
}

export const COD_HOLD_MINUTES = 30

function toMoneyString(value: number) {
  return value.toFixed(2)
}

async function decrementStock(
  shopId: string,
  productId: string,
  quantity: number,
) {
  const db = getDb()
  const updated = await db
    .update(inventory)
    .set({
      quantity: sql`${inventory.quantity} - ${quantity}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(inventory.shopId, shopId),
        eq(inventory.productId, productId),
        sql`${inventory.quantity} >= ${quantity}`,
      ),
    )
    .returning()

  if (updated.length === 0) {
    const [product] = await db
      .select({ name: products.name })
      .from(products)
      .where(eq(products.id, productId))
      .limit(1)

    throw new AppError(
      `Insufficient stock for ${product?.name ?? "product"}`,
      "INSUFFICIENT_STOCK",
      400,
    )
  }
}

async function incrementStock(
  shopId: string,
  productId: string,
  quantity: number,
) {
  const db = getDb()
  await db
    .update(inventory)
    .set({
      quantity: sql`${inventory.quantity} + ${quantity}`,
      updatedAt: new Date(),
    })
    .where(
      and(eq(inventory.shopId, shopId), eq(inventory.productId, productId)),
    )
}

export async function allocatePickupCode(shopId: string): Promise<string> {
  const db = getDb()
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const code = generatePickupCode()
    const [hit] = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.shopId, shopId), eq(orders.pickupCode, code)))
      .limit(1)
    if (!hit) return code
  }
  throw new AppError(
    "Could not allocate pickup code",
    "PICKUP_CODE_FAILED",
    500,
  )
}

/** Restore held units once. Safe to call repeatedly. */
export async function releaseOrderStock(orderId: string): Promise<boolean> {
  const db = getDb()
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order || order.stockReleased) {
    return false
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  for (const item of items) {
    await incrementStock(order.shopId, item.productId, item.quantity)
  }

  await db
    .update(orders)
    .set({
      stockReleased: true,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))

  return true
}

/**
 * Auto-cancel expired COD/pickup holds and restore stock.
 * Call opportunistically from catalog / dashboard loads.
 */
export async function expireStaleCustomerOrders(shopId?: string) {
  try {
    const db = getDb()
    const now = new Date()

    const conditions = [
      eq(orders.stockReleased, false),
      inArray(orders.status, [...ORDER_HOLD_STATUSES]),
      eq(orders.paymentMethod, "cod"),
      lt(orders.reservedUntil, now),
    ]
    if (shopId) {
      conditions.unshift(eq(orders.shopId, shopId))
    }

    const stale = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(...conditions))

    for (const row of stale) {
      const [existing] = await db
        .select({ status: orders.status })
        .from(orders)
        .where(eq(orders.id, row.id))
        .limit(1)

      await db
        .update(orders)
        .set({
          status: ORDER_STATUS.CANCELLED,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, row.id))
      await releaseOrderStock(row.id)
      await recordOrderEvent({
        orderId: row.id,
        eventType: ORDER_EVENT.EXPIRED,
        actorLabel: "System",
        fromStatus: existing?.status ?? ORDER_STATUS.PENDING,
        toStatus: ORDER_STATUS.CANCELLED,
        message: "Hold expired — stock released automatically",
      })
    }

    return stale.length
  } catch (error) {
    appLogger.warn("expireStaleCustomerOrders skipped", {
      shopId,
      error: error instanceof Error ? error.message : String(error),
    })
    return 0
  }
}

export async function listOrders(
  userId: string,
  shopId: string,
): Promise<Order[]> {
  await assertShopAccess(userId, shopId)
  await expireStaleCustomerOrders(shopId)
  const db = getDb()
  return db
    .select()
    .from(orders)
    .where(eq(orders.shopId, shopId))
    .orderBy(desc(orders.createdAt))
}

export async function getOrder(
  userId: string,
  orderId: string,
): Promise<OrderWithItems> {
  const db = getDb()
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) {
    throw new AppError("Order not found", "ORDER_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, order.shopId)

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return { ...order, items }
}

export async function getOrderDetail(
  userId: string,
  orderId: string,
): Promise<OrderDetail> {
  const db = getDb()
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) {
    throw new AppError("Order not found", "ORDER_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, order.shopId)

  const [rawItems, charges, events] = await Promise.all([
    db
      .select({
        item: orderItems,
        productName: products.name,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, orderId)),
    db.select().from(orderCharges).where(eq(orderCharges.orderId, orderId)),
    db
      .select()
      .from(orderEvents)
      .where(eq(orderEvents.orderId, orderId))
      .orderBy(desc(orderEvents.createdAt)),
  ])

  return {
    ...order,
    items: rawItems.map((row) => ({
      ...row.item,
      productName: row.productName,
    })),
    charges,
    events,
  }
}

/** Lookup by pickup code (exact) or phone digits / notes substring. */
export async function findShopOrders(
  userId: string,
  input: FindOrderLookupInput,
): Promise<Order[]> {
  debugger
  const data = findOrderLookupSchema.parse(input)
  await assertShopAccess(userId, data.shopId)
  await expireStaleCustomerOrders(data.shopId)

  const db = getDb()
  const q = data.query.trim()
  const code = q.toUpperCase().replace(/[^A-Z0-9]/g, "")

  const conditions = [eq(orders.shopId, data.shopId)]

  if (code.length >= 4 && code.length <= 8) {
    const [byCode] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.shopId, data.shopId), eq(orders.pickupCode, code)))
      .limit(1)
    if (byCode) return [byCode]
  }

  const pattern = `%${q}%`
  return db
    .select()
    .from(orders)
    .where(
      and(
        ...conditions,
        or(
          ilike(orders.pickupCode, pattern),
          ilike(orders.notes, pattern),
          ilike(orders.id, pattern),
        ),
      ),
    )
    .orderBy(desc(orders.createdAt))
    .limit(20)
}

export async function createOrder(
  userId: string,
  input: CreateOrderInput,
): Promise<OrderWithItems> {
  const data = createOrderSchema.parse(input)
  await assertShopAccess(userId, data.shopId)

  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  const shouldDecrement =
    data.paymentMethod === "cash" || data.status === ORDER_STATUS.COMPLETED

  if (shouldDecrement) {
    for (const item of data.items) {
      await decrementStock(data.shopId, item.productId, item.quantity)
    }
  }

  const pickupCode = await allocatePickupCode(data.shopId)
  const db = getDb()
  const [order] = await db
    .insert(orders)
    .values({
      shopId: data.shopId,
      customerId: data.customerId ?? null,
      pickupCode,
      status: data.status,
      totalAmount: toMoneyString(totalAmount),
      paymentMethod: data.paymentMethod,
      notes: data.notes ?? null,
      stockReleased: false,
    })
    .returning()

  if (!order) {
    throw new AppError("Failed to create order", "ORDER_CREATE_FAILED", 500)
  }

  const items = await db
    .insert(orderItems)
    .values(
      data.items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: toMoneyString(item.unitPrice),
      })),
    )
    .returning()

  if (data.paymentMethod === "cash") {
    await db.insert(transactions).values({
      orderId: order.id,
      status: "paid",
      amount: toMoneyString(totalAmount),
      paidAt: new Date(),
    })
  }

  await recordOrderEvent({
    orderId: order.id,
    eventType: ORDER_EVENT.PLACED,
    actorId: userId,
    actorLabel: "Shop staff",
    toStatus: data.status,
    message: `Order created (${data.paymentMethod})`,
  })

  return { ...order, items }
}

export async function updateOrderStatus(
  userId: string,
  input: UpdateOrderStatusInput,
  actorLabel = "Shop staff",
): Promise<Order> {
  const data = updateOrderStatusSchema.parse(input)
  const db = getDb()

  const [existing] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, data.orderId))
    .limit(1)

  if (!existing) {
    throw new AppError("Order not found", "ORDER_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, existing.shopId)

  if (
    existing.status === ORDER_STATUS.CANCELLED &&
    data.status !== ORDER_STATUS.CANCELLED
  ) {
    throw new AppError(
      "Cancelled orders cannot be reopened",
      "ORDER_CANCELLED",
      400,
    )
  }

  if (
    existing.status === ORDER_STATUS.COMPLETED &&
    data.status === ORDER_STATUS.CANCELLED
  ) {
    throw new AppError(
      "Completed orders cannot be cancelled",
      "ORDER_COMPLETED",
      400,
    )
  }

  if (existing.status === data.status) {
    return existing
  }

  const nextReservedUntil =
    data.status === ORDER_STATUS.COMPLETED ||
    data.status === ORDER_STATUS.CANCELLED
      ? null
      : data.status === ORDER_STATUS.CONFIRMED ||
          data.status === ORDER_STATUS.READY
        ? (() => {
            const d = new Date()
            d.setHours(d.getHours() + 2)
            return d
          })()
        : undefined

  const [order] = await db
    .update(orders)
    .set({
      status: data.status,
      updatedAt: new Date(),
      ...(nextReservedUntil !== undefined
        ? { reservedUntil: nextReservedUntil }
        : {}),
    })
    .where(eq(orders.id, data.orderId))
    .returning()

  if (!order) {
    throw new AppError("Failed to update order", "ORDER_UPDATE_FAILED", 500)
  }

  await recordOrderEvent({
    orderId: order.id,
    eventType: ORDER_EVENT.STATUS_CHANGED,
    actorId: userId,
    actorLabel,
    fromStatus: existing.status,
    toStatus: data.status,
    message: `${ORDER_STATUS_LABELS[existing.status as OrderStatus] ?? existing.status} → ${ORDER_STATUS_LABELS[data.status]}`,
  })

  if (data.status === ORDER_STATUS.CANCELLED && !existing.stockReleased) {
    await releaseOrderStock(order.id)
    const [refreshed] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, order.id))
      .limit(1)
    return refreshed ?? order
  }

  return order
}
