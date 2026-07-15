import { NextResponse } from "next/server"
import { z } from "zod"

import { requireApiUserId } from "@/features/auth/services/session"
import { getOrder, updateOrderStatus } from "@/features/orders/services/orders"
import {
  handleApiError,
  parseJsonBody,
  requireDatabase,
} from "@/shared/lib/api"
import { orderStatusSchema } from "@/shared/lib/validators/orders"

type RouteContext = {
  params: Promise<{ orderId: string }>
}

const orderIdSchema = z.string().uuid("Invalid order id")
const updateBodySchema = z.object({ status: orderStatusSchema })

export async function GET(_request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const orderId = orderIdSchema.parse((await context.params).orderId)

    const order = await getOrder(userId, orderId)
    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  try {
    requireDatabase()
    const userId = await requireApiUserId()
    const orderId = orderIdSchema.parse((await context.params).orderId)
    const { status } = updateBodySchema.parse(await parseJsonBody(request))

    const order = await updateOrderStatus(userId, { orderId, status })
    return NextResponse.json(order)
  } catch (error) {
    return handleApiError(error)
  }
}
