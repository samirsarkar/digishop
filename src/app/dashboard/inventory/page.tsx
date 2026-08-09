import { redirect } from "next/navigation"

import { ProductsCatalog } from "@/features/inventory/components/products-catalog"
import {
  listProductCategories,
  listProductsPage,
} from "@/features/inventory/services/products"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { loadMerchantShop } from "@/features/shop/services/shop"
import { DbUnavailableView } from "@/shared/components/db-unavailable"

export default async function InventoryPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const loaded = await loadMerchantShop(userId)
  if (loaded.status === "db_unavailable") {
    return <DbUnavailableView retryHref={SHOP_ROUTES.inventory} />
  }
  if (loaded.status === "no_shop") {
    redirect(SHOP_ROUTES.onboarding)
  }

  const { shop } = loaded

  let page
  let categories
  try {
    ;[page, categories] = await Promise.all([
      listProductsPage(userId, { shopId: shop.id, limit: 30 }),
      listProductCategories(userId, shop.id),
    ])
  } catch {
    return (
      <DbUnavailableView
        retryHref={SHOP_ROUTES.inventory}
        shopName={shop.name}
      />
    )
  }

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
