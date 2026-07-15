import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import { adjustStock } from "@/features/inventory/services/products"
import {
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { adjustStockSchema } from "@/shared/lib/validators/inventory"

type RouteContext = {
  params: Promise<{ productId: string }>
}

const productIdSchema = z.string().uuid("Invalid product id")
const bodySchema = adjustStockSchema.omit({ productId: true })

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const productId = productIdSchema.parse((await context.params).productId)
    const body = bodySchema.parse(await parseJsonBody(request))

    const product = await adjustStock(userId, { ...body, productId })
    return NextResponse.json(product)
  } catch (error) {
    return handleApiError(error)
  }
}
