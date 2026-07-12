"use server"

import {
  createPaymentIntent,
  type PaymentIntent,
} from "@/features/payments/services/payments"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  createPaymentIntentSchema,
  type CreatePaymentIntentInput,
} from "@/shared/lib/validators/payments"

export async function createPaymentIntentAction(
  input: CreatePaymentIntentInput
): Promise<ActionResult<PaymentIntent>> {
  return toActionResult(async () => {
    const data = createPaymentIntentSchema.parse(input)
    return createPaymentIntent(data)
  })
}
