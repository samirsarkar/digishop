import { AppError } from "@/shared/lib/errors"
import {
  createPaymentIntentSchema,
  type CreatePaymentIntentInput,
} from "@/shared/lib/validators/payments"

export type PaymentIntent = {
  orderId: string
  amount: number
  currency: string
  provider: "razorpay"
  status: "not_configured"
}

function isRazorpayConfigured() {
  return Boolean(
    process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  )
}

/** Stub until Razorpay keys are configured. */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<PaymentIntent> {
  const data = createPaymentIntentSchema.parse(input)

  if (!isRazorpayConfigured()) {
    throw new AppError(
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      "PAYMENTS_NOT_CONFIGURED",
      501
    )
  }

  return {
    orderId: data.orderId,
    amount: data.amount,
    currency: data.currency,
    provider: "razorpay",
    status: "not_configured",
  }
}
