import { ORDER_STATUS } from "@/features/orders/constants"
import {
  allocatePickupCode,
  type OrderWithItems,
} from "@/features/orders/services/orders"
import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import {
  inventory,
  orderCharges,
  orderItems,
  orders,
  products,
  transactions,
} from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  createCashSaleSchema,
  type CreateCashSaleInput,
} from "@/shared/lib/validators/orders"
import { and, eq, sql } from "drizzle-orm"

function toMoneyString(value: number) {
  return value.toFixed(2)
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

/** In-store cash sale: completed cash order, stock decrement, optional charges. */
export async function createCashSale(
  userId: string,
  input: CreateCashSaleInput
): Promise<OrderWithItems> {
  const data = createCashSaleSchema.parse(input)
  await assertShopAccess(userId, data.shopId)

  const itemsTotal = data.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )
  const chargesTotal = (data.charges ?? []).reduce(
    (sum, charge) => sum + charge.amount,
    0
  )
  const totalAmount = itemsTotal + chargesTotal

  for (const item of data.items) {
    await decrementStock(data.shopId, item.productId, item.quantity)
  }

  const pickupCode = await allocatePickupCode(data.shopId)
  const db = getDb()
  const [order] = await db
    .insert(orders)
    .values({
      shopId: data.shopId,
      pickupCode,
      status: ORDER_STATUS.COMPLETED,
      totalAmount: toMoneyString(totalAmount),
      paymentMethod: "cash",
      notes: data.notes ?? null,
      stockReleased: false,
    })
    .returning()

  if (!order) {
    throw new AppError("Failed to create sale", "ORDER_CREATE_FAILED", 500)
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

  if (data.charges && data.charges.length > 0) {
    await db.insert(orderCharges).values(
      data.charges.map((charge) => ({
        orderId: order.id,
        key: charge.key,
        label: charge.label,
        amount: toMoneyString(charge.amount),
      }))
    )
  }

  await db.insert(transactions).values({
    orderId: order.id,
    status: "paid",
    amount: toMoneyString(totalAmount),
    paidAt: new Date(),
  })

  const { recordOrderEvent } = await import(
    "@/features/orders/services/order-events"
  )
  const { ORDER_EVENT } = await import("@/features/orders/constants")
  await recordOrderEvent({
    orderId: order.id,
    eventType: ORDER_EVENT.PLACED,
    actorId: userId,
    actorLabel: "Shop staff (POS)",
    toStatus: ORDER_STATUS.COMPLETED,
    message: "In-store cash sale completed",
  })

  return { ...order, items }
}
