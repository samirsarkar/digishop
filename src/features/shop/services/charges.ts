import { and, asc, eq } from "drizzle-orm"

import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import { shopChargeRules, type ShopChargeRule } from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  setChargeEnabledSchema,
  upsertChargeRuleSchema,
  type SetChargeEnabledInput,
  type UpsertChargeRuleInput,
} from "@/shared/lib/validators/charges"

function toRateString(value: number) {
  return value.toFixed(4)
}

/** Ensure GST system rule exists (disabled by default). */
export async function ensureDefaultChargeRules(shopId: string) {
  const db = getDb()
  const [existing] = await db
    .select({ id: shopChargeRules.id })
    .from(shopChargeRules)
    .where(
      and(eq(shopChargeRules.shopId, shopId), eq(shopChargeRules.key, "gst"))
    )
    .limit(1)

  if (existing) return

  await db.insert(shopChargeRules).values({
    shopId,
    key: "gst",
    label: "GST",
    type: "percent",
    rate: "18.0000",
    enabled: false,
    sortOrder: 0,
    isSystem: true,
  })
}

export async function listChargeRules(
  userId: string,
  shopId: string
): Promise<ShopChargeRule[]> {
  await assertShopAccess(userId, shopId)
  await ensureDefaultChargeRules(shopId)
  const db = getDb()
  return db
    .select()
    .from(shopChargeRules)
    .where(eq(shopChargeRules.shopId, shopId))
    .orderBy(asc(shopChargeRules.sortOrder), asc(shopChargeRules.label))
}

export async function upsertChargeRule(
  userId: string,
  input: UpsertChargeRuleInput
): Promise<ShopChargeRule> {
  const data = upsertChargeRuleSchema.parse(input)
  await assertShopAccess(userId, data.shopId)
  await ensureDefaultChargeRules(data.shopId)
  const db = getDb()

  const [existing] = await db
    .select()
    .from(shopChargeRules)
    .where(
      and(
        eq(shopChargeRules.shopId, data.shopId),
        eq(shopChargeRules.key, data.key.toLowerCase())
      )
    )
    .limit(1)

  if (existing) {
    const [updated] = await db
      .update(shopChargeRules)
      .set({
        label: data.label,
        type: data.type,
        rate: toRateString(data.rate),
        enabled: data.enabled,
        sortOrder: data.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(shopChargeRules.id, existing.id))
      .returning()
    if (!updated) {
      throw new AppError("Failed to update charge", "CHARGE_UPDATE_FAILED", 500)
    }
    return updated
  }

  const [created] = await db
    .insert(shopChargeRules)
    .values({
      shopId: data.shopId,
      key: data.key.toLowerCase(),
      label: data.label,
      type: data.type,
      rate: toRateString(data.rate),
      enabled: data.enabled,
      sortOrder: data.sortOrder,
      isSystem: false,
    })
    .returning()

  if (!created) {
    throw new AppError("Failed to create charge", "CHARGE_CREATE_FAILED", 500)
  }
  return created
}

export async function setChargeEnabled(
  userId: string,
  input: SetChargeEnabledInput
): Promise<ShopChargeRule> {
  const data = setChargeEnabledSchema.parse(input)
  await assertShopAccess(userId, data.shopId)
  await ensureDefaultChargeRules(data.shopId)
  const db = getDb()

  const [updated] = await db
    .update(shopChargeRules)
    .set({
      enabled: data.enabled,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(shopChargeRules.shopId, data.shopId),
        eq(shopChargeRules.key, data.key.toLowerCase())
      )
    )
    .returning()

  if (!updated) {
    throw new AppError("Charge rule not found", "CHARGE_NOT_FOUND", 404)
  }
  return updated
}

