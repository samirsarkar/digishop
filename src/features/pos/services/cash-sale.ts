import { createOrder, type OrderWithItems } from "@/features/orders/services/orders"
import {
  createCashSaleSchema,
  type CreateCashSaleInput,
} from "@/shared/lib/validators/orders"

/** In-store cash sale: creates a completed cash order and decrements stock. */
export async function createCashSale(
  userId: string,
  input: CreateCashSaleInput
): Promise<OrderWithItems> {
  const data = createCashSaleSchema.parse(input)

  return createOrder(userId, {
    shopId: data.shopId,
    notes: data.notes,
    items: data.items,
    paymentMethod: "cash",
    status: "completed",
  })
}
