import { ORDER_EVENT, type OrderEventType } from "@/features/orders/constants"
import { getDb } from "@/lib/db"
import { orderEvents } from "@/lib/db/schema"

export async function recordOrderEvent(input: {
  orderId: string
  eventType: OrderEventType
  actorLabel: string
  actorId?: string | null
  fromStatus?: "pending" | "confirmed" | "ready" | "completed" | "cancelled" | null
  toStatus?: "pending" | "confirmed" | "ready" | "completed" | "cancelled" | null
  message?: string | null
}) {
  const db = getDb()
  await db.insert(orderEvents).values({
    orderId: input.orderId,
    eventType: input.eventType,
    actorLabel: input.actorLabel,
    actorId: input.actorId ?? null,
    fromStatus: input.fromStatus ?? null,
    toStatus: input.toStatus ?? null,
    message: input.message ?? null,
  })
}

export { ORDER_EVENT }
