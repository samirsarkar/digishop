import { z } from "zod"

export const shopSlugSchema = z
  .string()
  .trim()
  .min(2, "Slug must be at least 2 characters")
  .max(48, "Slug must be at most 48 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must be lowercase letters, numbers, and hyphens"
  )

export const contactTypeSchema = z.enum([
  "phone",
  "email",
  "whatsapp",
  "website",
  "instagram",
  "facebook",
  "other",
])

export const shopContactSchema = z
  .object({
    type: contactTypeSchema,
    value: z.string().trim().min(1).max(255),
    label: z.string().trim().max(64).optional().or(z.literal("")),
    isPrimary: z.boolean().optional().default(false),
  })
  .superRefine((contact, ctx) => {
    if (contact.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.value)) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid email address",
        path: ["value"],
      })
    }

    if (
      (contact.type === "website" ||
        contact.type === "instagram" ||
        contact.type === "facebook") &&
      !URL.canParse(contact.value) &&
      !contact.value.startsWith("@")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Enter a valid URL or @handle",
        path: ["value"],
      })
    }
  })

export const createShopSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: shopSlugSchema,
  gst: z.string().trim().max(32).optional().or(z.literal("")),
  address: z.string().trim().max(500).optional().or(z.literal("")),
  contacts: z.array(shopContactSchema).max(20).optional().default([]),
})

export const updateShopSchema = createShopSchema
  .omit({ contacts: true })
  .partial()
  .extend({
    shopId: z.string().uuid(),
  })

export const createShopContactSchema = shopContactSchema.extend({
  shopId: z.string().uuid(),
})

export const updateShopContactSchema = shopContactSchema.partial().extend({
  contactId: z.string().uuid(),
})

export type ContactType = z.infer<typeof contactTypeSchema>
export type ShopContactInput = z.infer<typeof shopContactSchema>
export type CreateShopInput = z.infer<typeof createShopSchema>
export type UpdateShopInput = z.infer<typeof updateShopSchema>
export type CreateShopContactInput = z.infer<typeof createShopContactSchema>
export type UpdateShopContactInput = z.infer<typeof updateShopContactSchema>
