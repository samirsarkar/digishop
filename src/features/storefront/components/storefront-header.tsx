"use client"

import Link from "next/link"
import { ShoppingBag } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { useCart } from "@/features/storefront/components/cart-provider"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

export function StorefrontHeader({
  shopName,
  shopSlug,
}: {
  shopName: string
  shopSlug: string
}) {
  const { itemCount, subtotal } = useCart()

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="min-w-0">
          <Link href={`/shop/${shopSlug}`} className="block truncate font-semibold">
            {shopName}
          </Link>
          <p className="truncate text-xs text-muted-foreground">
            Order online · pay at pickup
          </p>
        </div>
        <Link
          href={`/shop/${shopSlug}/checkout`}
          className={cn(buttonVariants({ size: "sm" }), "shrink-0 gap-1.5")}
        >
          <ShoppingBag className="size-3.5" />
          Cart {itemCount > 0 ? `(${itemCount})` : ""}
          {itemCount > 0 ? (
            <span className="font-numeric hidden sm:inline">
              · {formatInr(subtotal)}
            </span>
          ) : null}
        </Link>
      </div>
    </header>
  )
}
