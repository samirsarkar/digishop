"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { Search, Trash2 } from "lucide-react"

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
  findProductByCodeAction,
  listProductsPageAction,
} from "@/features/inventory/services/actions"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { createCashSaleAction } from "@/features/pos/services/actions"
import {
  listChargeRulesAction,
  setChargeEnabledAction,
  upsertChargeRuleAction,
} from "@/features/shop/services/charge-actions"
import { QuantityStepper } from "@/features/storefront/components/quantity-stepper"
import type { ShopChargeRule } from "@/lib/db/schema"
import { RupeeMark } from "@/shared/components/rupee-mark"
import { computeCharges } from "@/shared/lib/charges"
import { formatInr, RUPEE } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

type BillLine = {
  productId: string
  name: string
  price: number
  quantity: number
  maxQuantity: number
}

export function QuickBilling({ shopId }: { shopId: string }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<ProductWithStock[]>([])
  const [lines, setLines] = useState<BillLine[]>([])
  const [rules, setRules] = useState<ShopChargeRule[]>([])
  const [newChargeLabel, setNewChargeLabel] = useState("")
  const [newChargeRate, setNewChargeRate] = useState("")
  const [newChargeType, setNewChargeType] = useState<"percent" | "fixed">(
    "fixed"
  )

  useEffect(() => {
    startTransition(async () => {
      const result = await listChargeRulesAction(shopId)
      if (result.ok) setRules(result.data)
    })
  }, [shopId])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 1) return
    const t = window.setTimeout(() => {
      startTransition(async () => {
        const result = await listProductsPageAction({
          shopId,
          q,
          limit: 8,
          cursor: null,
        })
        if (result.ok) setHits(result.data.items)
      })
    }, 200)
    return () => window.clearTimeout(t)
  }, [query, shopId])

  const shownHits = query.trim() ? hits : []

  const subtotal = useMemo(
    () => lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [lines]
  )
  const appliedCharges = useMemo(
    () => computeCharges(subtotal, rules),
    [rules, subtotal]
  )
  const total =
    subtotal + appliedCharges.reduce((sum, c) => sum + c.amount, 0)

  function addProduct(product: ProductWithStock) {
    if (product.quantity <= 0) {
      setError(`${product.name} is out of stock`)
      return
    }
    setError(null)
    setSuccess(null)
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id)
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? {
                ...line,
                quantity: Math.min(line.quantity + 1, product.quantity),
                maxQuantity: product.quantity,
              }
            : line
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
          maxQuantity: product.quantity,
        },
      ]
    })
    setQuery("")
    setHits([])
  }

  function onScan(code: string) {
    setError(null)
    startTransition(async () => {
      const result = await findProductByCodeAction(shopId, code)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      if (!result.data) {
        setError(`No product for code ${code}`)
        return
      }
      addProduct(result.data)
    })
  }

  function checkout() {
    if (lines.length === 0) {
      setError("Add products to the bill first")
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await createCashSaleAction({
        shopId,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.price,
        })),
        charges: appliedCharges,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setLines([])
      setSuccess(
        `Sale complete · ${result.data.pickupCode ?? "OK"} · ${formatInr(result.data.totalAmount)}`
      )
    })
  }

  const gstRule = rules.find((r) => r.key === "gst")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quick billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Scan or search products, then complete a cash sale.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Add items</CardTitle>
            <CardDescription>Camera scan or type to search</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search name, SKU, barcode…"
                  className="flex h-10 w-full rounded-lg border border-input bg-background py-2 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>
              <BarcodeScannerButton onScan={onScan} />
            </div>
            {shownHits.length > 0 ? (
              <ul className="divide-y rounded-lg border">
                {shownHits.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-muted/60"
                      onClick={() => addProduct(product)}
                    >
                      <span className="min-w-0 truncate font-medium">
                        {product.name}
                      </span>
                      <span className="font-numeric shrink-0 text-muted-foreground">
                        {formatInr(product.price)} · {product.quantity} left
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}

            <ul className="divide-y rounded-lg border">
              {lines.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  Bill is empty
                </li>
              ) : (
                lines.map((line) => (
                  <li
                    key={line.productId}
                    className="flex flex-wrap items-center justify-between gap-2 px-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{line.name}</p>
                      <p className="font-numeric text-xs text-muted-foreground">
                        {formatInr(line.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <QuantityStepper
                        quantity={line.quantity}
                        maxQuantity={line.maxQuantity}
                        onChange={(next) =>
                          setLines((prev) =>
                            prev
                              .map((item) =>
                                item.productId === line.productId
                                  ? { ...item, quantity: next }
                                  : item
                              )
                              .filter((item) => item.quantity > 0)
                          )
                        }
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() =>
                          setLines((prev) =>
                            prev.filter((item) => item.productId !== line.productId)
                          )
                        }
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Total</CardTitle>
            <CardDescription>GST and extras are optional</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">GST (18%)</span>
              <Button
                type="button"
                size="sm"
                variant={gstRule?.enabled ? "default" : "outline"}
                disabled={pending || !gstRule}
                onClick={() => {
                  if (!gstRule) return
                  startTransition(async () => {
                    const result = await setChargeEnabledAction({
                      shopId,
                      key: "gst",
                      enabled: !gstRule.enabled,
                    })
                    if (result.ok) {
                      setRules((prev) =>
                        prev.map((r) =>
                          r.key === "gst" ? result.data : r
                        )
                      )
                    }
                  })
                }}
              >
                {gstRule?.enabled ? "GST on" : "Enable GST"}
              </Button>
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Add custom charge
              </p>
              <input
                value={newChargeLabel}
                onChange={(e) => setNewChargeLabel(e.target.value)}
                placeholder="Label (e.g. Packing)"
                className="flex h-9 w-full rounded-lg border border-input px-3 text-sm"
              />
              <div className="flex gap-2">
                <div className="flex shrink-0 rounded-lg border border-input p-0.5">
                  <button
                    type="button"
                    className={cn(
                      "h-8 rounded-md px-2.5 text-sm",
                      newChargeType === "fixed"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setNewChargeType("fixed")}
                  >
                    Fixed <RupeeMark />
                  </button>
                  <button
                    type="button"
                    className={cn(
                      "h-8 rounded-md px-2.5 text-sm",
                      newChargeType === "percent"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                    onClick={() => setNewChargeType("percent")}
                  >
                    Percent %
                  </button>
                </div>
                <input
                  value={newChargeRate}
                  onChange={(e) => setNewChargeRate(e.target.value)}
                  placeholder={newChargeType === "percent" ? "5" : `${RUPEE}10`}
                  className="font-numeric h-9 flex-1 rounded-lg border border-input px-3 text-sm"
                />
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="w-full"
                disabled={pending || !newChargeLabel.trim() || !newChargeRate}
                onClick={() => {
                  const key = newChargeLabel
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .slice(0, 40)
                  startTransition(async () => {
                    const result = await upsertChargeRuleAction({
                      shopId,
                      key,
                      label: newChargeLabel.trim(),
                      type: newChargeType,
                      rate: Number(newChargeRate),
                      enabled: true,
                      sortOrder: rules.length,
                    })
                    if (!result.ok) {
                      setError(result.error.message)
                      return
                    }
                    setRules((prev) => {
                      const others = prev.filter((r) => r.key !== result.data.key)
                      return [...others, result.data]
                    })
                    setNewChargeLabel("")
                    setNewChargeRate("")
                  })
                }}
              >
                Add charge
              </Button>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-numeric">{formatInr(subtotal)}</span>
              </div>
              {appliedCharges.map((charge) => (
                <div key={charge.key} className="flex justify-between">
                  <span className="text-muted-foreground">{charge.label}</span>
                  <span className="font-numeric">{formatInr(charge.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between border-t pt-2 text-base font-semibold">
                <span>Total</span>
                <span className="font-numeric">{formatInr(total)}</span>
              </div>
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

            <Button
              type="button"
              className="w-full"
              disabled={pending || lines.length === 0}
              onClick={checkout}
            >
              {pending ? "Processing…" : "Complete cash sale"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
