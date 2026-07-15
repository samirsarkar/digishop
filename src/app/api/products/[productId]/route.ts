import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import {
  deleteProduct,
  getProduct,
  updateProduct,
} from "@/features/inventory/services/products"
import {
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { updateProductFieldsSchema } from "@/shared/lib/validators/inventory"

type RouteContext = {
  params: Promise<{ productId: string }>
}

const productIdSchema = z.string().uuid("Invalid product id")

export async function GET(_request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const productId = productIdSchema.parse((await context.params).productId)

    const product = await getProduct(userId, productId)
    return NextResponse.json(product)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const productId = productIdSchema.parse((await context.params).productId)
    const fields = updateProductFieldsSchema.parse(await parseJsonBody(request))

    const product = await updateProduct(userId, { ...fields, productId })
    return NextResponse.json(product)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const productId = productIdSchema.parse((await context.params).productId)

    const result = await deleteProduct(userId, productId)
    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error)
  }
}
