import { redirect } from "next/navigation"

import { ProductsCatalog } from "@/features/inventory/components/products-catalog"
import {
  listProductCategories,
  listProductsPage,
} from "@/features/inventory/services/products"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { getShopForUser } from "@/features/shop/services/shop"

export default async function InventoryPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const shop = await getShopForUser(userId)
  if (!shop) {
    redirect(SHOP_ROUTES.onboarding)
  }

  const [page, categories] = await Promise.all([
    listProductsPage(userId, { shopId: shop.id, limit: 30 }),
    listProductCategories(userId, shop.id),
  ])

  return (
    <MerchantShell shopName={shop.name}>
      <ProductsCatalog
        shopId={shop.id}
        categories={categories}
        initialItems={page.items}
        initialCursor={page.nextCursor}
      />
    </MerchantShell>
  )
}
