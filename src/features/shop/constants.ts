export const SHOP_ROUTES = {
  onboarding: "/dashboard/onboarding",
  dashboard: "/dashboard",
} as const

export function slugifyShopName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
}
