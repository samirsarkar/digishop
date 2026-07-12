import { and, desc, eq, sql } from "drizzle-orm"

import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import {
  inventory,
  orderItems,
  orders,
  products,
  transactions,
  type Order,
  type OrderItem,
} from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
} from "@/shared/lib/validators/orders"

export type OrderWithItems = Order & { items: OrderItem[] }

function toMoneyString(value: number) {
  return value.toFixed(2)
}

export async function listOrders(
  userId: string,
  shopId: string
): Promise<Order[]> {
  await assertShopAccess(userId, shopId)
  const db = getDb()
  return db
    .select()
    .from(orders)
    .where(eq(orders.shopId, shopId))
    .orderBy(desc(orders.createdAt))
}

export async function getOrder(
  userId: string,
  orderId: string
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

async function decrementStock(
  shopId: string,
  productId: string,
  quantity: number
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
        sql`${inventory.quantity} >= ${quantity}`
      )
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
      400
    )
  }
}

export async function createOrder(
  userId: string,
  input: CreateOrderInput
): Promise<OrderWithItems> {
  const data = createOrderSchema.parse(input)
  await assertShopAccess(userId, data.shopId)

  const totalAmount = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  const shouldDecrement =
    data.paymentMethod === "cash" || data.status === "completed"

  if (shouldDecrement) {
    for (const item of data.items) {
      await decrementStock(data.shopId, item.productId, item.quantity)
    }
  }

  const db = getDb()
  const [order] = await db
    .insert(orders)
    .values({
      shopId: data.shopId,
      customerId: data.customerId ?? null,
      status: data.status,
      totalAmount: toMoneyString(totalAmount),
      paymentMethod: data.paymentMethod,
      notes: data.notes ?? null,
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
      }))
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

  return { ...order, items }
}

export async function updateOrderStatus(
  userId: string,
  input: UpdateOrderStatusInput
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

  const [order] = await db
    .update(orders)
    .set({
      status: data.status,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, data.orderId))
    .returning()

  if (!order) {
    throw new AppError("Failed to update order", "ORDER_UPDATE_FAILED", 500)
  }

  return order
}
