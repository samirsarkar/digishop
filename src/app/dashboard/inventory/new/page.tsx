import { redirect } from "next/navigation"

import { ProductForm } from "@/features/inventory/components/product-form"
import { listProductCategories } from "@/features/inventory/services/products"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { getShopForUser } from "@/features/shop/services/shop"

export default async function NewProductPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const shop = await getShopForUser(userId)
  if (!shop) {
    redirect(SHOP_ROUTES.onboarding)
  }

  const categories = await listProductCategories(userId, shop.id)

  return (
    <MerchantShell shopName={shop.name}>
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add product</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Owners and managers can add catalog items with category, SKU, and
            barcode.
          </p>
        </div>
        <ProductForm shopId={shop.id} categories={categories} />
      </div>
    </MerchantShell>
  )
}
