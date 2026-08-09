import { and, eq, inArray, sql } from "drizzle-orm"

import { getShopBySlug } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import {
  inventory,
  orderItems,
  orders,
  products,
  shops,
  type Order,
  type OrderItem,
} from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  createCustomerOrderSchema,
  type CreateCustomerOrderInput,
} from "@/shared/lib/validators/storefront"

export type CustomerOrderReceipt = Order & {
  items: OrderItem[]
  shopName: string
  shopSlug: string
}

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

/** Public customer checkout — pay at pickup (COD). Reserves stock. */
export async function createCustomerOrder(
  input: CreateCustomerOrderInput
): Promise<CustomerOrderReceipt> {
  const data = createCustomerOrderSchema.parse(input)
  const shop = await getShopBySlug(data.shopSlug)
  if (!shop) {
    throw new AppError("Shop not found", "SHOP_NOT_FOUND", 404)
  }

  const db = getDb()
  const productIds = data.items.map((item) => item.productId)

  const catalog = await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      quantity: inventory.quantity,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(and(eq(products.shopId, shop.id), inArray(products.id, productIds)))

  if (catalog.length !== productIds.length) {
    throw new AppError(
      "One or more products are unavailable",
      "PRODUCT_UNAVAILABLE",
      400
    )
  }

  const byId = new Map(catalog.map((row) => [row.id, row]))
  const pricedItems = data.items.map((item) => {
    const product = byId.get(item.productId)
    if (!product) {
      throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404)
    }
    const available = product.quantity ?? 0
    if (available < item.quantity) {
      throw new AppError(
        `Only ${available} left of ${product.name}`,
        "INSUFFICIENT_STOCK",
        400
      )
    }
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(product.price),
    }
  })

  const totalAmount = pricedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  )

  for (const item of pricedItems) {
    await decrementStock(shop.id, item.productId, item.quantity)
  }

  const noteParts = [
    `Customer: ${data.customerName}`,
    `Phone: ${data.customerPhone}`,
    data.notes?.trim() ? data.notes.trim() : null,
  ].filter(Boolean)

  const [order] = await db
    .insert(orders)
    .values({
      shopId: shop.id,
      status: "confirmed",
      totalAmount: toMoneyString(totalAmount),
      paymentMethod: "cod",
      notes: noteParts.join(" · "),
    })
    .returning()

  if (!order) {
    throw new AppError("Failed to place order", "ORDER_CREATE_FAILED", 500)
  }

  const items = await db
    .insert(orderItems)
    .values(
      pricedItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: toMoneyString(item.unitPrice),
      }))
    )
    .returning()

  return {
    ...order,
    items,
    shopName: shop.name,
    shopSlug: shop.slug,
  }
}

export async function getPublicOrderReceipt(
  orderId: string
): Promise<CustomerOrderReceipt> {
  const db = getDb()
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1)

  if (!order) {
    throw new AppError("Order not found", "ORDER_NOT_FOUND", 404)
  }

  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.id, order.shopId))
    .limit(1)

  if (!shop) {
    throw new AppError("Shop not found", "SHOP_NOT_FOUND", 404)
  }

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId))

  return {
    ...order,
    items,
    shopName: shop.name,
    shopSlug: shop.slug,
  }
}
