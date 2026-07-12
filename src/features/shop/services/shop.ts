import { and, eq } from "drizzle-orm"

import { getDb } from "@/lib/db"
import { shopContacts, shopMembers, shops, type Shop } from "@/lib/db/schema"
import { AppError } from "@/shared/lib/errors"
import {
  createShopSchema,
  shopContactSchema,
  updateShopSchema,
  type CreateShopInput,
  type UpdateShopInput,
} from "@/shared/lib/validators/shop"

function emptyToNull(value?: string | null) {
  if (!value || value.trim() === "") return null
  return value.trim()
}

export async function getShopByOwner(ownerId: string): Promise<Shop | null> {
  const db = getDb()
  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.ownerId, ownerId))
    .limit(1)
  return shop ?? null
}

export async function getShopBySlug(slug: string): Promise<Shop | null> {
  const db = getDb()
  const [shop] = await db
    .select()
    .from(shops)
    .where(eq(shops.slug, slug))
    .limit(1)
  return shop ?? null
}

export async function getShopForUser(userId: string): Promise<Shop | null> {
  const owned = await getShopByOwner(userId)
  if (owned) return owned

  const db = getDb()
  const [membership] = await db
    .select({ shop: shops })
    .from(shopMembers)
    .innerJoin(shops, eq(shopMembers.shopId, shops.id))
    .where(eq(shopMembers.clerkId, userId))
    .limit(1)

  return membership?.shop ?? null
}

export async function requireShopForUser(userId: string): Promise<Shop> {
  const shop = await getShopForUser(userId)
  if (!shop) {
    throw new AppError("Shop not found. Complete onboarding first.", "SHOP_NOT_FOUND", 404)
  }
  return shop
}

export async function assertShopAccess(userId: string, shopId: string): Promise<Shop> {
  const shop = await requireShopForUser(userId)
  if (shop.id !== shopId) {
    throw new AppError("You do not have access to this shop", "FORBIDDEN", 403)
  }
  return shop
}

export async function createShop(
  ownerId: string,
  input: CreateShopInput
): Promise<Shop> {
  const data = createShopSchema.parse(input)
  const existing = await getShopForUser(ownerId)
  if (existing) {
    throw new AppError("You already have a shop", "SHOP_EXISTS", 409)
  }

  const slugTaken = await getShopBySlug(data.slug)
  if (slugTaken) {
    throw new AppError("This shop URL is already taken", "SLUG_TAKEN", 409)
  }

  const db = getDb()
  const [shop] = await db
    .insert(shops)
    .values({
      ownerId,
      name: data.name,
      slug: data.slug,
      gst: emptyToNull(data.gst),
      address: emptyToNull(data.address),
    })
    .returning()

  if (!shop) {
    throw new AppError("Failed to create shop", "SHOP_CREATE_FAILED", 500)
  }

  await db.insert(shopMembers).values({
    clerkId: ownerId,
    shopId: shop.id,
    role: "owner",
  })

  if (data.contacts.length > 0) {
    const contacts = data.contacts.map((contact) =>
      shopContactSchema.parse(contact)
    )
    await db.insert(shopContacts).values(
      contacts.map((contact) => ({
        shopId: shop.id,
        type: contact.type,
        value: contact.value.trim(),
        label: emptyToNull(contact.label),
        isPrimary: contact.isPrimary ?? false,
      }))
    )
  }

  return shop
}

export async function updateShop(
  userId: string,
  input: UpdateShopInput
): Promise<Shop> {
  const data = updateShopSchema.parse(input)
  await assertShopAccess(userId, data.shopId)

  if (data.slug) {
    const slugTaken = await getShopBySlug(data.slug)
    if (slugTaken && slugTaken.id !== data.shopId) {
      throw new AppError("This shop URL is already taken", "SLUG_TAKEN", 409)
    }
  }

  const db = getDb()
  const [shop] = await db
    .update(shops)
    .set({
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.slug !== undefined ? { slug: data.slug } : {}),
      ...(data.gst !== undefined ? { gst: emptyToNull(data.gst) } : {}),
      ...(data.address !== undefined ? { address: emptyToNull(data.address) } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(shops.id, data.shopId), eq(shops.ownerId, userId)))
    .returning()

  if (!shop) {
    throw new AppError("Failed to update shop", "SHOP_UPDATE_FAILED", 500)
  }

  return shop
}
