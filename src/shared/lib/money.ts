/**
 * Indian Rupee sign (U+20B9) — the ONLY character to use for ₹.
 * Never paste a lookalike from another keyboard/script.
 *
 * In UI: wrap with `font-numeric` or use `<RupeeMark />`.
 * Never put this character inside native `<option>` labels (OS fonts break it).
 * Prefer `formatInr()` for amounts.
 */
export const RUPEE = "\u20B9"

function toAmount(value: number | string) {
  const amount = typeof value === "string" ? Number(value) : value
  return Number.isFinite(amount) ? amount : 0
}

/**
 * Format an amount as Indian Rupees, e.g. ₹1,299.50
 * Prefixes with RUPEE (U+20B9). Callers must render with `font-numeric`
 * so the glyph is taken from Roboto (latin-ext), not a broken system fallback.
 */
export function formatInr(value: number | string) {
  const amount = toAmount(value)
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${RUPEE}${formatted}`
}

