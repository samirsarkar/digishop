"use client"

import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/features/storefront/components/cart-provider"
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
  const { addItem } = useCart()
  const [category, setCategory] = useState("")
  const [addedId, setAddedId] = useState<string | null>(null)

  const categories = useMemo(() => {
    const set = new Set(
      products
        .map((p) => p.category)
        .filter((value): value is string => Boolean(value && value.trim()))
    )
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [products])

  const visible = category
    ? products.filter((p) => p.category === category)
    : products

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
    setAddedId(product.id)
    window.setTimeout(() => setAddedId(null), 1200)
  }

  return (
    <div className="space-y-5">
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
          <p className="font-medium">No products available</p>
          <p className="mt-1 text-sm text-muted-foreground">
            This shop hasn&apos;t listed in-stock items yet.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {visible.map((product) => {
            const out = product.quantity <= 0
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
                      <span className="px-2 text-center">{product.name.slice(0, 20)}</span>
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
                    <Button
                      type="button"
                      size="sm"
                      disabled={out}
                      onClick={() => onAdd(product)}
                    >
                      {addedId === product.id ? "Added" : "Add"}
                    </Button>
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
