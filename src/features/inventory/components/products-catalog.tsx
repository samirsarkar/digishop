"use client"

import { useCallback, useEffect, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { PackagePlus, Printer } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { listProductsPageAction } from "@/features/inventory/services/actions"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

type ProductsCatalogProps = {
  shopId: string
  categories: string[]
  initialItems: ProductWithStock[]
  initialCursor: string | null
  initialCategory?: string
}

export function ProductsCatalog({
  shopId,
  categories,
  initialItems,
  initialCursor,
  initialCategory = "",
}: ProductsCatalogProps) {
  const [category, setCategory] = useState(initialCategory)
  const [items, setItems] = useState(initialItems)
  const [cursor, setCursor] = useState<string | null>(initialCursor)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const resetForCategory = useCallback(
    (nextCategory: string) => {
      setCategory(nextCategory)
      setError(null)
      startTransition(async () => {
        const result = await listProductsPageAction({
          shopId,
          category: nextCategory || undefined,
          cursor: null,
          limit: 30,
        })
        if (!result.ok) {
          setError(result.error.message)
          return
        }
        setItems(result.data.items)
        setCursor(result.data.nextCursor)
      })
    },
    [shopId]
  )

  const loadMore = useCallback(async () => {
    if (!cursor || loadingRef.current || pending) return
    loadingRef.current = true
    setLoadingMore(true)
    try {
      const result = await listProductsPageAction({
        shopId,
        category: category || undefined,
        cursor,
        limit: 30,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setItems((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        const merged = [...prev]
        for (const item of result.data.items) {
          if (!seen.has(item.id)) merged.push(item)
        }
        return merged
      })
      setCursor(result.data.nextCursor)
    } finally {
      loadingRef.current = false
      setLoadingMore(false)
    }
  }, [category, cursor, pending, shopId])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: "240px" }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse inventory, filter by category, and manage stock.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={SHOP_ROUTES.addProduct}
            className={cn(buttonVariants())}
          >
            <PackagePlus className="size-4" />
            Add product
          </Link>
          <Link
            href={SHOP_ROUTES.barcodes}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <Printer className="size-4" />
            Barcodes
          </Link>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <FilterChip
          label="All"
          active={category === ""}
          onClick={() => resetForCategory("")}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={category === cat}
            onClick={() => resetForCategory(cat)}
          />
        ))}
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {items.length === 0 && !pending ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">No products yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first product to start tracking stock and sales.
          </p>
          <Link
            href={SHOP_ROUTES.addProduct}
            className={cn(buttonVariants(), "mt-4")}
          >
            Add product
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((product) => {
            const low = product.quantity <= product.lowStockThreshold
            return (
              <li key={product.id} className="min-w-0">
                <article className="flex h-full max-w-44 flex-col overflow-hidden rounded-xl border bg-card p-2.5 shadow-xs sm:max-w-none sm:p-3">
                  <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-muted/60 text-xs text-muted-foreground">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="size-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center leading-tight">
                        {product.name.slice(0, 18)}
                      </span>
                    )}
                  </div>
                  <h2 className="line-clamp-2 text-xs font-medium leading-snug sm:text-sm">
                    {product.name}
                  </h2>
                  {product.category ? (
                    <p className="mt-1 truncate text-[10px] text-muted-foreground sm:text-xs">
                      {product.category}
                    </p>
                  ) : null}
                  <p className="font-numeric mt-auto pt-2 text-sm font-semibold">
                    {formatInr(product.price)}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-1">
                    <span className="font-numeric text-[10px] text-muted-foreground sm:text-xs">
                      Qty {product.quantity}
                    </span>
                    {low ? (
                      <Badge variant="destructive" className="h-4 px-1.5 text-[9px]">
                        Low
                      </Badge>
                    ) : null}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}

      <div ref={sentinelRef} className="h-8" aria-hidden />
      {loadingMore ? (
        <p className="text-center text-sm text-muted-foreground">Loading more…</p>
      ) : null}
      {!cursor && items.length > 0 ? (
        <p className="text-center text-xs text-muted-foreground">
          End of inventory
        </p>
      ) : null}
    </div>
  )
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:bg-muted"
      )}
    >
      {label}
    </button>
  )
}
