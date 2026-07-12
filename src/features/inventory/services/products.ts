import { and, eq, sql } from "drizzle-orm"

import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import { inventory, products, shops, type Product } from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  adjustStockSchema,
  createProductSchema,
  updateProductSchema,
  type AdjustStockInput,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/shared/lib/validators/inventory"

export type ProductWithStock = Product & {
  quantity: number
  lowStockThreshold: number
}

function emptyToNull(value?: string | null) {
  if (!value || value.trim() === "") return null
  return value.trim()
}

function toMoneyString(value: number) {
  return value.toFixed(2)
}

export async function listProducts(
  userId: string,
  shopId: string
): Promise<ProductWithStock[]> {
  await assertShopAccess(userId, shopId)
  const db = getDb()

  const rows = await db
    .select({
      product: products,
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(eq(products.shopId, shopId))

  return rows.map((row) => ({
    ...row.product,
    quantity: row.quantity ?? 0,
    lowStockThreshold: row.lowStockThreshold ?? 5,
  }))
}

export async function listProductsByShopSlug(
  slug: string
): Promise<ProductWithStock[]> {
  const db = getDb()

  const rows = await db
    .select({
      product: products,
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(products)
    .innerJoin(shops, eq(shops.id, products.shopId))
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(and(eq(shops.slug, slug), sql`coalesce(${inventory.quantity}, 0) > 0`))

  return rows.map((row) => ({
    ...row.product,
    quantity: row.quantity ?? 0,
    lowStockThreshold: row.lowStockThreshold ?? 5,
  }))
}

export async function createProduct(
  userId: string,
  input: CreateProductInput
): Promise<ProductWithStock> {
  const data = createProductSchema.parse(input)
  await assertShopAccess(userId, data.shopId)
  const db = getDb()

  const [product] = await db
    .insert(products)
    .values({
      shopId: data.shopId,
      name: data.name,
      sku: emptyToNull(data.sku),
      barcode: emptyToNull(data.barcode),
      price: toMoneyString(data.price),
      costPrice:
        data.costPrice !== undefined ? toMoneyString(data.costPrice) : null,
      imageUrl: emptyToNull(data.imageUrl),
      description: emptyToNull(data.description),
    })
    .returning()

  if (!product) {
    throw new AppError("Failed to create product", "PRODUCT_CREATE_FAILED", 500)
  }

  const [stock] = await db
    .insert(inventory)
    .values({
      productId: product.id,
      shopId: data.shopId,
      quantity: data.quantity,
      lowStockThreshold: data.lowStockThreshold,
    })
    .returning()

  return {
    ...product,
    quantity: stock?.quantity ?? data.quantity,
    lowStockThreshold: stock?.lowStockThreshold ?? data.lowStockThreshold,
  }
}

export async function updateProduct(
  userId: string,
  input: UpdateProductInput
): Promise<Product> {
  const data = updateProductSchema.parse(input)
  const db = getDb()

  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, data.productId))
    .limit(1)

  if (!existing) {
    throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, existing.shopId)

  const [product] = await db
    .update(products)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.sku !== undefined ? { sku: emptyToNull(data.sku) } : {}),
      ...(data.barcode !== undefined
        ? { barcode: emptyToNull(data.barcode) }
        : {}),
      ...(data.price !== undefined ? { price: toMoneyString(data.price) } : {}),
      ...(data.costPrice !== undefined
        ? { costPrice: toMoneyString(data.costPrice) }
        : {}),
      ...(data.imageUrl !== undefined
        ? { imageUrl: emptyToNull(data.imageUrl) }
        : {}),
      ...(data.description !== undefined
        ? { description: emptyToNull(data.description) }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(products.id, data.productId))
    .returning()

  if (!product) {
    throw new AppError("Failed to update product", "PRODUCT_UPDATE_FAILED", 500)
  }

  return product
}

export async function deleteProduct(
  userId: string,
  productId: string
): Promise<{ id: string }> {
  const db = getDb()
  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)

  if (!existing) {
    throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, existing.shopId)

  await db.delete(products).where(eq(products.id, productId))
  return { id: productId }
}

export async function adjustStock(
  userId: string,
  input: AdjustStockInput
): Promise<ProductWithStock> {
  const data = adjustStockSchema.parse(input)
  const db = getDb()

  const [existing] = await db
    .select({
      product: products,
      quantity: inventory.quantity,
      lowStockThreshold: inventory.lowStockThreshold,
      inventoryId: inventory.id,
    })
    .from(products)
    .leftJoin(inventory, eq(inventory.productId, products.id))
    .where(eq(products.id, data.productId))
    .limit(1)

  if (!existing) {
    throw new AppError("Product not found", "PRODUCT_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, existing.product.shopId)

  const nextQuantity = (existing.quantity ?? 0) + data.delta
  if (nextQuantity < 0) {
    throw new AppError("Insufficient stock", "INSUFFICIENT_STOCK", 400)
  }

  if (!existing.inventoryId) {
    const [stock] = await db
      .insert(inventory)
      .values({
        productId: data.productId,
        shopId: existing.product.shopId,
        quantity: nextQuantity,
        lowStockThreshold: data.lowStockThreshold ?? 5,
      })
      .returning()

    return {
      ...existing.product,
      quantity: stock?.quantity ?? nextQuantity,
      lowStockThreshold: stock?.lowStockThreshold ?? 5,
    }
  }

  const [stock] = await db
    .update(inventory)
    .set({
      quantity: nextQuantity,
      ...(data.lowStockThreshold !== undefined
        ? { lowStockThreshold: data.lowStockThreshold }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(inventory.id, existing.inventoryId))
    .returning()

  return {
    ...existing.product,
    quantity: stock?.quantity ?? nextQuantity,
    lowStockThreshold:
      stock?.lowStockThreshold ?? existing.lowStockThreshold ?? 5,
  }
}
