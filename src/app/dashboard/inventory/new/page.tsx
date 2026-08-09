import { redirect } from "next/navigation"

import { ProductIntake } from "@/features/inventory/components/product-intake"
import { listProductCategories } from "@/features/inventory/services/products"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { loadMerchantShop } from "@/features/shop/services/shop"
import { DbUnavailableView } from "@/shared/components/db-unavailable"

export default async function NewProductPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const loaded = await loadMerchantShop(userId)
  if (loaded.status === "db_unavailable") {
    return <DbUnavailableView retryHref={SHOP_ROUTES.addProduct} />
  }
  if (loaded.status === "no_shop") {
    redirect(SHOP_ROUTES.onboarding)
  }

  const { shop } = loaded

  let categories
  try {
    categories = await listProductCategories(userId, shop.id)
  } catch {
    return (
      <DbUnavailableView
        retryHref={SHOP_ROUTES.addProduct}
        shopName={shop.name}
      />
    )
  }

  return (
    <MerchantShell shopName={shop.name}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Add / restock
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new catalog item, or add stock to a product you already
            sell by scanning or searching.
          </p>
        </div>
        <ProductIntake shopId={shop.id} categories={categories} />
      </div>
    </MerchantShell>
  )
}
