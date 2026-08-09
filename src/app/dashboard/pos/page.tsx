import { redirect } from "next/navigation"

import { QuickBilling } from "@/features/pos/components/quick-billing"
import { requireUserId } from "@/features/auth/services/session"
import { MerchantShell } from "@/features/shop/components/merchant-shell"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { loadMerchantShop } from "@/features/shop/services/shop"
import { DbUnavailableView } from "@/shared/components/db-unavailable"

export default async function PosPage() {
  const userId = await requireUserId()

  if (!process.env.DATABASE_URL) {
    redirect(SHOP_ROUTES.dashboard)
  }

  const loaded = await loadMerchantShop(userId)
  if (loaded.status === "db_unavailable") {
    return <DbUnavailableView retryHref={SHOP_ROUTES.pos} />
  }
  if (loaded.status === "no_shop") {
    redirect(SHOP_ROUTES.onboarding)
  }

  return (
    <MerchantShell shopName={loaded.shop.name}>
      <QuickBilling shopId={loaded.shop.id} />
    </MerchantShell>
  )
}
