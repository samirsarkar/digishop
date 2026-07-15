import { NextResponse } from "next/server"

import { requireApiUserId } from "@/features/auth/services/session"
import { createCashSale } from "@/features/pos/services/cash-sale"
import {
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { createCashSaleSchema } from "@/shared/lib/validators/orders"

export async function POST(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const input = createCashSaleSchema.parse(await parseJsonBody(request))

    const order = await createCashSale(userId, input)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
