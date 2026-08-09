"use server"

import {
  createCustomerOrder,
  getPublicOrderReceipt,
  type CustomerOrderReceipt,
} from "@/features/storefront/services/checkout"
import { toActionResult, type ActionResult } from "@/shared/lib/errors"
import {
  createCustomerOrderSchema,
  type CreateCustomerOrderInput,
} from "@/shared/lib/validators/storefront"

export async function placeCustomerOrderAction(
  input: CreateCustomerOrderInput
): Promise<ActionResult<CustomerOrderReceipt>> {
  return toActionResult(async () => {
    const data = createCustomerOrderSchema.parse(input)
    return createCustomerOrder(data)
  })
}

export async function getOrderReceiptAction(
  orderId: string
): Promise<ActionResult<CustomerOrderReceipt>> {
  return toActionResult(async () => getPublicOrderReceipt(orderId))
}
