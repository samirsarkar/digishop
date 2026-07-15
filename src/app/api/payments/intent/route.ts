import { NextResponse } from "next/server"

import { requireApiUserId } from "@/features/auth/services/session"
import { createPaymentIntent } from "@/features/payments/services/payments"
import { handleApiError, parseJsonBody } from "@/shared/lib/api"
import { createPaymentIntentSchema } from "@/shared/lib/validators/payments"

export async function POST(request: Request) {
  try {
    await requireApiUserId()
    const input = createPaymentIntentSchema.parse(await parseJsonBody(request))

    const intent = await createPaymentIntent(input)
    return NextResponse.json(intent, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
