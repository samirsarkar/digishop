import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import {
  createProduct,
  listProductsPage,
} from "@/features/inventory/services/products"
import {
  getQueryParams,
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { createProductSchema } from "@/shared/lib/validators/inventory"

const listQuerySchema = z.object({
  shopId: z.string().uuid(),
  category: z.string().optional(),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(60).optional(),
})

export async function GET(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const query = listQuerySchema.parse(getQueryParams(request))

    const page = await listProductsPage(userId, {
      shopId: query.shopId,
      category: query.category,
      cursor: query.cursor ?? null,
      limit: query.limit ?? 30,
    })
    return NextResponse.json(page)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const input = createProductSchema.parse(await parseJsonBody(request))

    const product = await createProduct(userId, input)
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
