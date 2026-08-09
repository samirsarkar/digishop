"use client"

import { useEffect, useState, useTransition, type FormEvent } from "react"
import { Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarcodeScannerButton } from "@/features/inventory/components/barcode-scanner-button"
import {
  adjustStockAction,
  findProductByCodeAction,
  listProductsPageAction,
} from "@/features/inventory/services/actions"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

const fieldClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

type RestockFormProps = {
  shopId: string
  initialProduct?: ProductWithStock | null
  onCleared?: () => void
}

export function RestockForm({
  shopId,
  initialProduct = null,
  onCleared,
}: RestockFormProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<ProductWithStock[]>([])
  const [selected, setSelected] = useState<ProductWithStock | null>(
    initialProduct
  )
  const [qty, setQty] = useState("1")

  useEffect(() => {
    const q = query.trim()
    if (q.length < 1) return
    const t = window.setTimeout(() => {
      startTransition(async () => {
        const result = await listProductsPageAction({
          shopId,
          q,
          limit: 10,
          cursor: null,
        })
        if (result.ok) setHits(result.data.items)
      })
    }, 200)
    return () => window.clearTimeout(t)
  }, [query, shopId])

  const shownHits = query.trim() ? hits : []

  function pickProduct(product: ProductWithStock) {
    setSelected(product)
    setQuery("")
    setHits([])
    setError(null)
    setSuccess(null)
  }

  function clearSelection() {
    setSelected(null)
    setQty("1")
    setQuery("")
    setHits([])
    setError(null)
    setSuccess(null)
    onCleared?.()
  }

  function onScan(code: string) {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await findProductByCodeAction(shopId, code)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      if (!result.data) {
        setError(`No product found for “${code}”. Add it as a new product first.`)
        return
      }
      pickProduct(result.data)
    })
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!selected) {
      setError("Select or scan a product first")
      return
    }
    const delta = Number(qty)
    if (!Number.isInteger(delta) || delta < 1) {
      setError("Enter a whole number of 1 or more")
      return
    }

    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await adjustStockAction({
        productId: selected.id,
        delta,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setSelected(result.data)
      setQty("1")
      setSuccess(
        `Added ${delta} to ${result.data.name}. Stock is now ${result.data.quantity}.`
      )
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restock</CardTitle>
        <CardDescription>
          Scan a barcode/QR or search inventory, then add units to an existing
          product.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="restock-search">
            Find product
          </label>
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="restock-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, SKU, barcode…"
                className={cn(fieldClass, "pl-9")}
                autoComplete="off"
              />
            </div>
            <BarcodeScannerButton onScan={onScan} />
          </div>
          {shownHits.length > 0 ? (
            <ul className="max-h-48 divide-y overflow-y-auto rounded-lg border">
              {shownHits.map((product) => (
                <li key={product.id}>
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-muted/50"
                    onClick={() => pickProduct(product)}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {product.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {[product.barcode, product.sku]
                          .filter(Boolean)
                          .join(" · ") || "No code"}
                      </span>
                    </span>
                    <span className="shrink-0 font-numeric text-xs text-muted-foreground">
                      Stock {product.quantity}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {selected ? (
          <div className="rounded-lg border bg-muted/30 px-3 py-3 text-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-medium">{selected.name}</p>
                <p className="mt-1 text-muted-foreground">
                  {[selected.barcode, selected.sku].filter(Boolean).join(" · ") ||
                    "No barcode/SKU yet"}
                </p>
                <p className="font-numeric mt-1 text-muted-foreground">
                  Current stock: {selected.quantity} ·{" "}
                  {formatInr(Number(selected.price))}
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="shrink-0"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No product selected yet.
          </p>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="restock-qty" className="text-sm font-medium">
              Quantity to add
            </label>
            <input
              id="restock-qty"
              type="number"
              min={1}
              step={1}
              required
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className={cn(fieldClass, "max-w-40 font-numeric")}
              disabled={!selected}
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-primary" role="status">
              {success}
            </p>
          ) : null}

          <Button type="submit" disabled={pending || !selected}>
            {pending ? "Updating…" : "Add to stock"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
