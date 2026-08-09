"use client"

import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/storefront/components/cart-provider"
import { QuantityStepper } from "@/features/storefront/components/quantity-stepper"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

export type StorefrontProduct = {
  id: string
  name: string
  category: string | null
  price: string
  imageUrl: string | null
  description: string | null
  quantity: number
}

export function StorefrontCatalog({
  products,
}: {
  products: StorefrontProduct[]
}) {
  const { lines, addItem, setQuantity } = useCart()
  const [category, setCategory] = useState("")
  const [query, setQuery] = useState("")

  const qtyByProduct = useMemo(() => {
    const map = new Map<string, number>()
    for (const line of lines) {
      map.set(line.productId, line.quantity)
    }
    return map
  }, [lines])

  const categories = useMemo(() => {
    const set = new Set(
      products
        .map((p) => p.category)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (category && p.category !== category) return false
      if (!q) return true
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [category, products, query])

  function onAdd(product: StorefrontProduct) {
    if (product.quantity <= 0) return
    addItem({
      productId: product.id,
      name: product.name,
      price: Number(product.price),
      maxQuantity: product.quantity,
      imageUrl: product.imageUrl,
      quantity: 1,
    })
  }

  return (
    <div className="space-y-5">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
          className="flex h-10 w-full rounded-lg border border-input bg-background py-2 pr-9 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-muted"
            onClick={() => setQuery("")}
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {categories.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <FilterChip
            label="All"
            active={category === ""}
            onClick={() => setCategory("")}
          />
          {categories.map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={category === cat}
              onClick={() => setCategory(cat)}
            />
          ))}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed px-6 py-16 text-center">
          <p className="font-medium">
            {query || category
              ? "No products match"
              : "No products available"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {query || category
              ? "Try another search or clear filters."
              : "This shop hasn't listed in-stock items yet."}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((product) => {
            const out = product.quantity <= 0
            const inCart = qtyByProduct.get(product.id) ?? 0
            return (
              <li key={product.id} className="min-w-0">
                <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-card p-3">
                  <div className="mb-2 flex aspect-square items-center justify-center rounded-lg bg-muted/60 text-xs text-muted-foreground">
                    {product.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={product.imageUrl}
                        alt=""
                        className="size-full rounded-lg object-cover"
                      />
                    ) : (
                      <span className="px-2 text-center">
                        {product.name.slice(0, 20)}
                      </span>
                    )}
                  </div>
                  <h2 className="line-clamp-2 text-sm font-medium leading-snug">
                    {product.name}
                  </h2>
                  {product.category ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {product.category}
                    </p>
                  ) : null}
                  <p className="font-numeric mt-2 text-sm font-semibold">
                    {formatInr(product.price)}
                  </p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                    {out ? (
                      <Badge variant="secondary">Out of stock</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {product.quantity} left
                      </span>
                    )}
                    {out ? null : inCart > 0 ? (
                      <QuantityStepper
                        quantity={inCart}
                        maxQuantity={product.quantity}
                        onChange={(next) => setQuantity(product.id, next)}
                      />
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => onAdd(product)}
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
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
