export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  READY: "ready",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_VALUES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.READY,
  ORDER_STATUS.COMPLETED,
  ORDER_STATUS.CANCELLED,
] as const satisfies readonly OrderStatus[]

/** COD holds that can still auto-expire */
export const ORDER_HOLD_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.CONFIRMED,
] as const

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [ORDER_STATUS.PENDING]: "Pending",
  [ORDER_STATUS.CONFIRMED]: "Confirmed",
  [ORDER_STATUS.READY]: "Ready",
  [ORDER_STATUS.COMPLETED]: "Completed",
  [ORDER_STATUS.CANCELLED]: "Cancelled",
}

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_VALUES as readonly string[]).includes(value)
}

export function getOrderStatusLabel(status: string): string {
  return isOrderStatus(status) ? ORDER_STATUS_LABELS[status] : status
}

export function getOrderStatusHeadline(status: string): string {
  if (status === ORDER_STATUS.CANCELLED) return "Order cancelled"
  if (status === ORDER_STATUS.COMPLETED) return "Order complete"
  return "Order placed"
}

export function getOrderStatusDescription(
  status: string,
  shopName: string
): string {
  if (status === ORDER_STATUS.PENDING) {
    return `Waiting for ${shopName} to confirm. Pay at pickup.`
  }
  if (status === ORDER_STATUS.CANCELLED) {
    return "This order was cancelled. Stock has been released."
  }
  return `Show this at ${shopName}. Pay at pickup.`
}

export const ORDER_EVENT = {
  PLACED: "placed",
  STATUS_CHANGED: "status_changed",
  EXPIRED: "expired",
} as const

export type OrderEventType = (typeof ORDER_EVENT)[keyof typeof ORDER_EVENT]

/** Crockford-like alphabet without 0/O/1/I */
const PICKUP_CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"

export function generatePickupCode(length = 6): string {
  let code = ""
  for (let i = 0; i < length; i += 1) {
    const idx = Math.floor(Math.random() * PICKUP_CODE_ALPHABET.length)
    code += PICKUP_CODE_ALPHABET[idx]
  }
  return code
}
