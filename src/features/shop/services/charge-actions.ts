"use server"

import { revalidatePath } from "next/cache"

import { requireUserId } from "@/features/auth/services/session"
import {
  listChargeRules,
  setChargeEnabled,
  upsertChargeRule,
} from "@/features/shop/services/charges"
import type { ShopChargeRule } from "@/lib/db/schema"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  setChargeEnabledSchema,
  upsertChargeRuleSchema,
  type SetChargeEnabledInput,
  type UpsertChargeRuleInput,
} from "@/shared/lib/validators/charges"

export async function listChargeRulesAction(
  shopId: string
): Promise<ActionResult<ShopChargeRule[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return listChargeRules(userId, shopId)
  })
}

export async function upsertChargeRuleAction(
  input: UpsertChargeRuleInput
): Promise<ActionResult<ShopChargeRule>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = upsertChargeRuleSchema.parse(input)
    const rule = await upsertChargeRule(userId, data)
    revalidatePath("/dashboard/pos")
    return rule
  })
}

export async function setChargeEnabledAction(
  input: SetChargeEnabledInput
): Promise<ActionResult<ShopChargeRule>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = setChargeEnabledSchema.parse(input)
    const rule = await setChargeEnabled(userId, data)
    revalidatePath("/dashboard/pos")
    return rule
  })
}
