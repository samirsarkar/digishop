import { notFound } from "next/navigation"

import { CartProvider } from "@/features/storefront/components/cart-provider"
import { CheckoutForm } from "@/features/storefront/components/checkout-form"
import { StorefrontHeader } from "@/features/storefront/components/storefront-header"
import { getShopBySlug } from "@/features/shop/services/shop"

type PageProps = {
  params: Promise<{ shopSlug: string }>
}

export default async function ShopCheckoutPage({ params }: PageProps) {
  const { shopSlug } = await params

  if (!process.env.DATABASE_URL) {
    notFound()
  }

  const shop = await getShopBySlug(shopSlug)
  if (!shop) {
    notFound()
  }

  return (
    <CartProvider shopSlug={shop.slug}>
      <div className="flex min-h-full flex-col">
        <StorefrontHeader shopName={shop.name} shopSlug={shop.slug} />
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
          <h1 className="mb-6 text-2xl font-semibold tracking-tight">Checkout</h1>
          <CheckoutForm shopSlug={shop.slug} shopName={shop.name} />
        </main>
      </div>
    </CartProvider>
  )
}
