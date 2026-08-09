import { notFound } from "next/navigation"

import { CartProvider } from "@/features/storefront/components/cart-provider"
import { StorefrontCatalog } from "@/features/storefront/components/storefront-catalog"
import { StorefrontHeader } from "@/features/storefront/components/storefront-header"
import { getPublicShopCatalog } from "@/features/storefront/services/catalog"

type PageProps = {
  params: Promise<{ shopSlug: string }>
}

export default async function PublicShopPage({ params }: PageProps) {
  const { shopSlug } = await params

  if (!process.env.DATABASE_URL) {
    notFound()
  }

  let catalog
  try {
    catalog = await getPublicShopCatalog(shopSlug)
  } catch {
    notFound()
  }

  return (
    <CartProvider shopSlug={catalog.shop.slug}>
      <div className="flex min-h-full flex-col">
        <StorefrontHeader
          shopName={catalog.shop.name}
          shopSlug={catalog.shop.slug}
        />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <div className="mb-6 space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              {catalog.shop.name}
            </h1>
            {catalog.shop.address ? (
              <p className="text-sm text-muted-foreground">
                {catalog.shop.address}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Browse live stock and reserve for pickup.
              </p>
            )}
          </div>
          <StorefrontCatalog products={catalog.products} />
        </main>
      </div>
    </CartProvider>
  )
}
