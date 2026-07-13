/** Indian Rupee formatting used across merchant UI. */
export function formatInr(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value
  if (!Number.isFinite(amount)) return "₹0"

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`
}
