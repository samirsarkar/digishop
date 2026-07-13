export const SHOP_ROUTES = {
  onboarding: "/dashboard/onboarding",
  dashboard: "/dashboard",
  inventory: "/dashboard/inventory",
  addProduct: "/dashboard/inventory/new",
  barcodes: "/dashboard/inventory/barcodes",
} as const

export function slugifyShopName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}

/** Unique-ish shop SKU: DS-XXXXXX-XXXX */
export function generateProductSku() {
  const time = Date.now().toString(36).toUpperCase().slice(-6)
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `DS-${time}-${rand}`
}
