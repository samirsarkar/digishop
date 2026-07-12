import { z } from "zod"

const moneySchema = z
  .union([z.string(), z.number()])
  .transform((value) => Number(value))
  .refine((value) => Number.isFinite(value) && value >= 0, "Invalid amount")

export const createProductSchema = z.object({
  shopId: z.string().uuid(),
  name: z.string().trim().min(1).max(200),
  sku: z.string().trim().max(64).optional().or(z.literal("")),
  barcode: z.string().trim().max(64).optional().or(z.literal("")),
  price: moneySchema,
  costPrice: moneySchema.optional(),
  imageUrl: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) => !value || value === "" || URL.canParse(value),
      "Invalid image URL"
    ),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
})

export const updateProductSchema = createProductSchema
  .omit({ shopId: true, quantity: true, lowStockThreshold: true })
  .partial()
  .extend({
    productId: z.string().uuid(),
  })

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  delta: z.number().int(),
  lowStockThreshold: z.number().int().min(0).optional(),
})

export type CreateProductInput = z.infer<typeof createProductSchema>
export type UpdateProductInput = z.infer<typeof updateProductSchema>
export type AdjustStockInput = z.infer<typeof adjustStockSchema>
