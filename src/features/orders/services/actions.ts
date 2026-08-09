"use server"

import { revalidatePath } from "next/cache"

import { requireUserId, getCurrentUser } from "@/features/auth/services/session"
import {
  createOrder,
  findShopOrders,
  getOrder,
  getOrderDetail,
  listOrders,
  updateOrderStatus,
  type OrderDetail,
  type OrderWithItems,
} from "@/features/orders/services/orders"
import type { Order } from "@/lib/db/schema"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  createOrderSchema,
  findOrderLookupSchema,
  updateOrderStatusSchema,
  type CreateOrderInput,
  type FindOrderLookupInput,
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

export async function getOrderDetailAction(
  orderId: string
): Promise<ActionResult<OrderDetail>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return getOrderDetail(userId, orderId)
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
    revalidatePath("/dashboard/orders")
    return order
  })
}

export async function updateOrderStatusAction(
  input: UpdateOrderStatusInput
): Promise<ActionResult<Order>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const user = await getCurrentUser()
    const actorLabel =
      user?.primaryEmailAddress?.emailAddress ??
      user?.fullName ??
      user?.username ??
      "Shop staff"
    const data = updateOrderStatusSchema.parse(input)
    const order = await updateOrderStatus(userId, data, actorLabel)
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/orders")
    return order
  })
}

export async function findShopOrdersAction(
  input: FindOrderLookupInput
): Promise<ActionResult<Order[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = findOrderLookupSchema.parse(input)
    return findShopOrders(userId, data)
  })
}
