import { z } from "zod"

import { ORDER_STATUS, ORDER_STATUS_VALUES } from "@/features/orders/constants"

export const orderStatusSchema = z.enum(ORDER_STATUS_VALUES)

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
  status: orderStatusSchema.default(ORDER_STATUS.COMPLETED),
})

export const updateOrderStatusSchema = z.object({
  orderId: z.string().uuid(),
  status: orderStatusSchema,
})

export const orderChargeInputSchema = z.object({
  key: z.string().trim().min(1).max(40),
  label: z.string().trim().min(1).max(80),
  amount: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 0),
})

export const createCashSaleSchema = z.object({
  shopId: z.string().uuid(),
  notes: z.string().trim().max(500).optional(),
  items: z.array(orderItemInputSchema).min(1),
  charges: z.array(orderChargeInputSchema).optional(),
})

export const findOrderLookupSchema = z.object({
  shopId: z.string().uuid(),
  query: z.string().trim().min(1).max(80),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>
export type CreateCashSaleInput = z.infer<typeof createCashSaleSchema>
export type FindOrderLookupInput = z.infer<typeof findOrderLookupSchema>
