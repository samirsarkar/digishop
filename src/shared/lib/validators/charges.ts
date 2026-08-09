import { z } from "zod"

export const chargeRuleTypeSchema = z.enum(["percent", "fixed"])

export const upsertChargeRuleSchema = z.object({
  shopId: z.string().uuid(),
  key: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9_-]+$/i, "Use letters, numbers, _ or -"),
  label: z.string().trim().min(1).max(80),
  type: chargeRuleTypeSchema,
  rate: z
    .union([z.string(), z.number()])
    .transform((value) => Number(value))
    .refine((value) => Number.isFinite(value) && value >= 0),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
})

export const setChargeEnabledSchema = z.object({
  shopId: z.string().uuid(),
  key: z.string().trim().min(1).max(40),
  enabled: z.boolean(),
})

export type UpsertChargeRuleInput = z.infer<typeof upsertChargeRuleSchema>
export type SetChargeEnabledInput = z.infer<typeof setChargeEnabledSchema>
