import { z } from "zod"

export const orderStatusSchema = z.enum([
  "pending",
  "confirmed",
  "ready",
  "completed",
  "cancelled",
])

export const paymentMethodSchema = z.enum([
  "cash",
  "upi",
  "card",
  "cod",
  "razorpay",
])

export const orderItemInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 0),
})

export const createOrderSchema = z.object({
  shopId: z.string().uuid(),
  customerId: z.string().optional(),
  paymentMethod: paymentMethodSchema.default("cash"),
  notes: z.string().trim().max(500).optional(),
  items: z.array(orderItemInputSchema).min(1),
  status: orderStatusSchema.default("completed"),
})

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: orderStatusSchema,
})

export const createCashSaleSchema = z.object({
  shopId: z.string().uuid(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(orderItemInputSchema).min(1),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type CreateCashSaleInput = z.infer<typeof createCashSaleSchema>
