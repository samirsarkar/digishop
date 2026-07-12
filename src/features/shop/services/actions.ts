"use server"

import { revalidatePath } from "next/cache"

import { requireUserId } from "@/features/auth/services/session"
import { SHOP_ROUTES } from "@/features/shop/constants"
import {
  addShopContact,
  deleteShopContact,
  listShopContactsForUser,
  updateShopContact,
} from "@/features/shop/services/contacts"
import { createShop, updateShop } from "@/features/shop/services/shop"
import type { Shop, ShopContact } from "@/lib/db/schema"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  createShopContactSchema,
  createShopSchema,
  updateShopContactSchema,
  updateShopSchema,
  type CreateShopContactInput,
  type CreateShopInput,
  type UpdateShopContactInput,
  type UpdateShopInput,
} from "@/shared/lib/validators/shop"

export async function createShopAction(
  input: CreateShopInput
): Promise<ActionResult<Shop>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = createShopSchema.parse(input)
    const shop = await createShop(userId, data)
    revalidatePath(SHOP_ROUTES.dashboard)
    revalidatePath(SHOP_ROUTES.onboarding)
    return shop
  })
}

export async function updateShopAction(
  input: UpdateShopInput
): Promise<ActionResult<Shop>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = updateShopSchema.parse(input)
    const shop = await updateShop(userId, data)
    revalidatePath(SHOP_ROUTES.dashboard)
    return shop
  })
}

export async function listShopContactsAction(
  shopId: string
): Promise<ActionResult<ShopContact[]>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    return listShopContactsForUser(userId, shopId)
  })
}

export async function addShopContactAction(
  input: CreateShopContactInput
): Promise<ActionResult<ShopContact>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = createShopContactSchema.parse(input)
    const contact = await addShopContact(userId, data)
    revalidatePath(SHOP_ROUTES.dashboard)
    return contact
  })
}

export async function updateShopContactAction(
  input: UpdateShopContactInput
): Promise<ActionResult<ShopContact>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const data = updateShopContactSchema.parse(input)
    const contact = await updateShopContact(userId, data)
    revalidatePath(SHOP_ROUTES.dashboard)
    return contact
  })
}

export async function deleteShopContactAction(
  contactId: string
): Promise<ActionResult<{ id: string }>> {
  return toActionResult(async () => {
    const userId = await requireUserId()
    const result = await deleteShopContact(userId, contactId)
    revalidatePath(SHOP_ROUTES.dashboard)
    return result
  })
}
