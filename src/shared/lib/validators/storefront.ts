import { z } from "zod"

import { orderItemInputSchema } from "@/shared/lib/validators/orders"

export const createCustomerOrderSchema = z.object({
  shopSlug: z
    .string()
    .trim()
    .min(2)
    .max(48)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  customerName: z.string().trim().min(2).max(120),
  customerPhone: z.string().trim().min(8).max(20),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
})

export type CreateCustomerOrderInput = z.infer<typeof createCustomerOrderSchema>

// Re-export for cart line typing convenience
export type CustomerOrderItemInput = z.infer<typeof orderItemInputSchema>
