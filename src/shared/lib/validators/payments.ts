import { z } from "zod"

export const createPaymentIntentSchema = z.object({
  orderId: z.string().uuid(),
  amount: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value > 0, "Invalid amount"),
  currency: z.string().default("INR"),
})

export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>
