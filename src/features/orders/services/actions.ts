"use server"

import { revalidatePath } from "next/cache"

import { requireUserId } from "@/features/auth/services/session"
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  type OrderWithItems,
} from "@/features/orders/services/orders"
import type { Order } from "@/lib/db/schema"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  createOrderSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type UpdateOrderStatusInput,
} from "@/shared/lib/validators/orders"

export async function listOrdersAction(
  shopId: string
): Promise<ActionResult<Order[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return listOrders(userId, shopId)
  })
}

export async function getOrderAction(
  orderId: string
): Promise<ActionResult<OrderWithItems>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return getOrder(userId, orderId)
  })
}

export async function createOrderAction(
  input: CreateOrderInput
): Promise<ActionResult<OrderWithItems>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = createOrderSchema.parse(input)
    const order = await createOrder(userId, data)
    revalidatePath("/dashboard")
    return order
  })
}

export async function updateOrderStatusAction(
  input: UpdateOrderStatusInput
): Promise<ActionResult<Order>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = updateOrderStatusSchema.parse(input)
    const order = await updateOrderStatus(userId, data)
    revalidatePath("/dashboard")
    return order
  })
}
