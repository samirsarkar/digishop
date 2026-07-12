"use server"

import { requireUserId } from "@/features/auth/services/session"
import {
  getShopSummary,
  type ShopSummary,
} from "@/features/analytics/services/summary"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"

export async function getShopSummaryAction(
  shopId: string
): Promise<ActionResult<ShopSummary>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return getShopSummary(userId, shopId)
  })
}
