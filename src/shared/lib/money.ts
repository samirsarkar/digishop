/** Indian Rupee sign (U+20B9) — always use this, not "Rs" or "INR". */
export const RUPEE = "\u20B9"

/**
 * Format an amount as Indian Rupees, e.g. ₹1,299.50
 */
export function formatInr(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(amount)) {
    return `${RUPEE}0`
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    currencyDisplay: "symbol",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)
}
