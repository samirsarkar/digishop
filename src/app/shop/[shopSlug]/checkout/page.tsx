import Link from "next/link"
import { notFound } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { CartProvider } from "@/features/storefront/components/cart-provider"
import { CheckoutForm } from "@/features/storefront/components/checkout-form"
import { StorefrontHeader } from "@/features/storefront/components/storefront-header"
import { getShopBySlug } from "@/features/shop/services/shop"
import { cn } from "@/lib/utils"

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
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
            <Link
              href={`/shop/${shop.slug}`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              ← Continue shopping
            </Link>
          </div>
          <CheckoutForm shopSlug={shop.slug} shopName={shop.name} />
        </main>
      </div>
    </CartProvider>
  )
}
