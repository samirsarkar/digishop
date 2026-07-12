"use server"

import { revalidatePath } from "next/cache"

import { requireUserId } from "@/features/auth/services/session"
import type { OrderWithItems } from "@/features/orders/services/orders"
import { createCashSale } from "@/features/pos/services/cash-sale"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  createCashSaleSchema,
  type CreateCashSaleInput,
} from "@/shared/lib/validators/orders"

export async function createCashSaleAction(
  input: CreateCashSaleInput
): Promise<ActionResult<OrderWithItems>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = createCashSaleSchema.parse(input)
    const order = await createCashSale(userId, data)
    revalidatePath("/dashboard")
    return order
  })
}
