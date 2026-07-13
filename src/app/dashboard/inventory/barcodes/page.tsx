import { redirect } from "next/navigation"

import { BarcodePrintSection } from "@/features/inventory/components/barcode-print-section"
import { listProducts } from "@/features/inventory/services/products"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { getShopForUser } from "@/features/shop/services/shop"

export default async function BarcodesPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const shop = await getShopForUser(userId)
  if (!shop) {
    redirect(SHOP_ROUTES.onboarding)
  }

  const products = await listProducts(userId, shop.id)

  return (
    <MerchantShell shopName={shop.name}>
      <BarcodePrintSection products={products} />
    </MerchantShell>
  )
}
