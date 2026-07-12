import { and, asc, eq } from "drizzle-orm"

import { assertShopAccess } from "@/features/shop/services/shop"
import { getDb } from "@/lib/db"
import { shopContacts, type ShopContact } from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  createShopContactSchema,
  shopContactSchema,
  updateShopContactSchema,
  type CreateShopContactInput,
  type ShopContactInput,
  type UpdateShopContactInput,
} from "@/shared/lib/validators/shop"

function emptyToNull(value?: string | null) {
  if (!value || value.trim() === "") return null
  return value.trim()
}

export async function listShopContacts(shopId: string): Promise<ShopContact[]> {
  const db = getDb()
  return db
    .select()
    .from(shopContacts)
    .where(eq(shopContacts.shopId, shopId))
    .orderBy(asc(shopContacts.createdAt))
}

export async function listShopContactsForUser(
  userId: string,
  shopId: string
): Promise<ShopContact[]> {
  await assertShopAccess(userId, shopId)
  return listShopContacts(shopId)
}

export async function insertShopContacts(
  shopId: string,
  contacts: ShopContactInput[]
): Promise<ShopContact[]> {
  if (contacts.length === 0) return []

  const parsed = contacts.map((contact) => shopContactSchema.parse(contact))
  const db = getDb()

  return db
    .insert(shopContacts)
    .values(
      parsed.map((contact) => ({
        shopId,
        type: contact.type,
        value: contact.value.trim(),
        label: emptyToNull(contact.label),
        isPrimary: contact.isPrimary ?? false,
      }))
    )
    .returning()
}

export async function addShopContact(
  userId: string,
  input: CreateShopContactInput
): Promise<ShopContact> {
  const data = createShopContactSchema.parse(input)
  await assertShopAccess(userId, data.shopId)

  const [contact] = await insertShopContacts(data.shopId, [data])
  if (!contact) {
    throw new AppError("Failed to add contact", "CONTACT_CREATE_FAILED", 500)
  }
  return contact
}

export async function updateShopContact(
  userId: string,
  input: UpdateShopContactInput
): Promise<ShopContact> {
  const data = updateShopContactSchema.parse(input)
  const db = getDb()

  const [existing] = await db
    .select()
    .from(shopContacts)
    .where(eq(shopContacts.id, data.contactId))
    .limit(1)

  if (!existing) {
    throw new AppError("Contact not found", "CONTACT_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, existing.shopId)

  const [contact] = await db
    .update(shopContacts)
    .set({
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.value !== undefined ? { value: data.value.trim() } : {}),
      ...(data.label !== undefined ? { label: emptyToNull(data.label) } : {}),
      ...(data.isPrimary !== undefined ? { isPrimary: data.isPrimary } : {}),
      updatedAt: new Date(),
    })
    .where(
      and(eq(shopContacts.id, data.contactId), eq(shopContacts.shopId, existing.shopId))
    )
    .returning()

  if (!contact) {
    throw new AppError("Failed to update contact", "CONTACT_UPDATE_FAILED", 500)
  }

  return contact
}

export async function deleteShopContact(
  userId: string,
  contactId: string
): Promise<{ id: string }> {
  const db = getDb()
  const [existing] = await db
    .select()
    .from(shopContacts)
    .where(eq(shopContacts.id, contactId))
    .limit(1)

  if (!existing) {
    throw new AppError("Contact not found", "CONTACT_NOT_FOUND", 404)
  }

  await assertShopAccess(userId, existing.shopId)
  await db.delete(shopContacts).where(eq(shopContacts.id, contactId))
  return { id: contactId }
}
