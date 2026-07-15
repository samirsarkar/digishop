import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import { createOrder, listOrders } from "@/features/orders/services/orders"
import {
  getQueryParams,
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { createOrderSchema } from "@/shared/lib/validators/orders"

const listQuerySchema = z.object({ shopId: z.string().uuid() })

export async function GET(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const { shopId } = listQuerySchema.parse(getQueryParams(request))

    const orders = await listOrders(userId, shopId)
    return NextResponse.json({ orders })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const input = createOrderSchema.parse(await parseJsonBody(request))

    const order = await createOrder(userId, input)
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
