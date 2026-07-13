"use server"

import { revalidatePath } from "next/cache"

import { requireUserId } from "@/features/auth/services/session"
import {
  adjustStock,
  createProduct,
  deleteProduct,
  listProductCategories,
  listProducts,
  listProductsPage,
  updateProduct,
  type ProductWithStock,
  type ProductsPage,
} from "@/features/inventory/services/products"
import type { Product } from "@/lib/db/schema"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  adjustStockSchema,
  createProductSchema,
  listProductsPageSchema,
  updateProductSchema,
  type AdjustStockInput,
  type CreateProductInput,
  type ListProductsPageInput,
  type UpdateProductInput,
} from "@/shared/lib/validators/inventory"

export async function listProductsAction(
  shopId: string
): Promise<ActionResult<ProductWithStock[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return listProducts(userId, shopId)
  })
}

export async function listProductsPageAction(
  input: ListProductsPageInput
): Promise<ActionResult<ProductsPage>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = listProductsPageSchema.parse(input)
    return listProductsPage(userId, data)
  })
}

export async function listProductCategoriesAction(
  shopId: string
): Promise<ActionResult<string[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return listProductCategories(userId, shopId)
  })
}

export async function createProductAction(
  input: CreateProductInput
): Promise<ActionResult<ProductWithStock>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = createProductSchema.parse(input)
    const product = await createProduct(userId, data)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/inventory/barcodes")
    return product
  })
}

export async function updateProductAction(
  input: UpdateProductInput
): Promise<ActionResult<Product>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = updateProductSchema.parse(input)
    const product = await updateProduct(userId, data)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/inventory/barcodes")
    return product
  })
}

export async function deleteProductAction(
  productId: string
): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const result = await deleteProduct(userId, productId)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/inventory")
    revalidatePath("/dashboard/inventory/barcodes")
    return result
  })
}

export async function adjustStockAction(
  input: AdjustStockInput
): Promise<ActionResult<ProductWithStock>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = adjustStockSchema.parse(input)
    const product = await adjustStock(userId, data)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/inventory")
    return product
  })
}
