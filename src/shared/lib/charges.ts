export type ChargeRuleLike = {
  key: string
  label: string
  type: "percent" | "fixed"
  rate: string | number
  enabled: boolean
}

export type AppliedCharge = {
  key: string
  label: string
  amount: number
}

export function computeCharges(
  subtotal: number,
  rules: ChargeRuleLike[]
): AppliedCharge[] {
  return rules
    .filter((rule) => rule.enabled)
    .map((rule) => {
      const rate = Number(rule.rate)
      const amount =
        rule.type === "percent" ? (subtotal * rate) / 100 : rate
      return {
        key: rule.key,
        label: rule.label,
        amount: Math.round(amount * 100) / 100,
      }
    })
}
