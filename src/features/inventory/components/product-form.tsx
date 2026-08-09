"use client"

import { useMemo, useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Check, Copy } from "lucide-react"

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
  allocateNextBarcodeAction,
  createProductAction,
  findProductByCodeAction,
} from "@/features/inventory/services/actions"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { generateProductSku, SHOP_ROUTES } from "@/features/shop/constants"
import { RupeeMark } from "@/shared/components/rupee-mark"

const fieldClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

const SUGGESTED_CATEGORIES = [
  "Grocery",
  "Snacks",
  "Beverages",
  "Dairy",
  "Personal care",
  "Household",
  "Electronics",
  "Other",
]

type ProductFormProps = {
  shopId: string
  categories?: string[]
  onSwitchToRestock?: (product: ProductWithStock) => void
}

export function ProductForm({
  shopId,
  categories = [],
  onSwitchToRestock,
}: ProductFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [price, setPrice] = useState("")
  const [costPrice, setCostPrice] = useState("")
  const [quantity, setQuantity] = useState("0")
  const [lowStockThreshold, setLowStockThreshold] = useState("5")
  const [sku, setSku] = useState("")
  const [barcode, setBarcode] = useState("")
  const [description, setDescription] = useState("")
  const [existingHit, setExistingHit] = useState<ProductWithStock | null>(null)

  const categoryOptions = useMemo(() => {
    const set = new Set([...SUGGESTED_CATEGORIES, ...categories])
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [categories])

  function reset() {
    setName("")
    setCategory("")
    setPrice("")
    setCostPrice("")
    setQuantity("0")
    setLowStockThreshold("5")
    setSku("")
    setBarcode("")
    setDescription("")
    setCopied(false)
    setExistingHit(null)
  }

  function onGenerateSku() {
    setSku(generateProductSku())
    setCopied(false)
  }

  function onGenerateBarcode() {
    setError(null)
    startTransition(async () => {
      const result = await allocateNextBarcodeAction(shopId)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setBarcode(result.data.barcode)
      setExistingHit(null)
    })
  }

  async function onCopySku() {
    if (!sku.trim()) return
    try {
      await navigator.clipboard.writeText(sku.trim())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setError("Could not copy SKU to clipboard")
    }
  }

  function checkExistingBarcode(code: string) {
    const value = code.trim()
    if (!value) {
      setExistingHit(null)
      return
    }
    startTransition(async () => {
      const result = await findProductByCodeAction(shopId, value)
      if (result.ok && result.data) {
        setExistingHit(result.data)
      } else {
        setExistingHit(null)
      }
    })
  }

  function onBarcodeScan(code: string) {
    setBarcode(code)
    checkExistingBarcode(code)
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (existingHit) {
      setError(
        "This barcode already belongs to a product. Restock it instead of creating a duplicate."
      )
      return
    }

    startTransition(async () => {
      const result = await createProductAction({
        shopId,
        name,
        category,
        price: Number(price),
        costPrice: costPrice === "" ? undefined : Number(costPrice),
        quantity: Number(quantity) || 0,
        lowStockThreshold: Number(lowStockThreshold) || 0,
        sku,
        barcode,
        description,
      })

      if (!result.ok) {
        setError(result.error.message)
        return
      }

      reset()
      router.push(SHOP_ROUTES.inventory)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>New product</CardTitle>
        <CardDescription>
          Prices use Indian Rupees (<RupeeMark />). Scan a manufacturer barcode
          or generate a unique DigiShop code (DS00000001…).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="product-name" className="text-sm font-medium">
              Name
            </label>
            <input
              id="product-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Tata Salt 1kg"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="product-category" className="text-sm font-medium">
              Category
            </label>
            <input
              id="product-category"
              list="product-category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={fieldClass}
              placeholder="e.g. Grocery"
            />
            <datalist id="product-category-options">
              {categoryOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label htmlFor="product-price" className="text-sm font-medium">
              Selling price (<RupeeMark />)
            </label>
            <input
              id="product-price"
              required
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={fieldClass}
              placeholder="40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product-cost" className="text-sm font-medium">
              Cost price (<RupeeMark />){" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <input
              id="product-cost"
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              className={fieldClass}
              placeholder="32"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product-qty" className="text-sm font-medium">
              Opening stock
            </label>
            <input
              id="product-qty"
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="product-low" className="text-sm font-medium">
              Low-stock alert at
            </label>
            <input
              id="product-low"
              type="number"
              min="0"
              step="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className={fieldClass}
            />
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <label htmlFor="product-sku" className="text-sm font-medium">
                SKU <span className="text-muted-foreground">(optional)</span>
              </label>
              <button
                type="button"
                onClick={onGenerateSku}
                className="text-xs font-medium text-primary underline underline-offset-2"
              >
                generate-sku
              </button>
            </div>
            <div className="flex gap-2">
              <input
                id="product-sku"
                value={sku}
                onChange={(e) => {
                  setSku(e.target.value)
                  setCopied(false)
                }}
                className={fieldClass}
                placeholder="DS-XXXXXX-XXXX"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={!sku.trim()}
                onClick={() => void onCopySku()}
                aria-label="Copy SKU"
                title={copied ? "SKU copied" : "Copy SKU"}
              >
                {copied ? (
                  <Check className="size-4 text-primary" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            </div>
            {copied ? (
              <p className="text-xs text-primary" role="status">
                SKU copied
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <label htmlFor="product-barcode" className="text-sm font-medium">
                Barcode <span className="text-muted-foreground">(optional)</span>
              </label>
              <button
                type="button"
                onClick={onGenerateBarcode}
                disabled={pending}
                className="text-xs font-medium text-primary underline underline-offset-2"
              >
                generate
              </button>
            </div>
            <div className="flex gap-2">
              <input
                id="product-barcode"
                value={barcode}
                onChange={(e) => {
                  setBarcode(e.target.value)
                  setExistingHit(null)
                }}
                onBlur={() => checkExistingBarcode(barcode)}
                className={fieldClass}
                placeholder="Scan, type, or generate"
              />
              <BarcodeScannerButton onScan={onBarcodeScan} />
            </div>
            {existingHit && onSwitchToRestock ? (
              <div
                className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm"
                role="status"
              >
                <p>
                  Already in inventory:{" "}
                  <span className="font-medium">{existingHit.name}</span>{" "}
                  (stock {existingHit.quantity}).
                </p>
                <button
                  type="button"
                  className="mt-1 text-xs font-medium text-primary underline underline-offset-2"
                  onClick={() => onSwitchToRestock(existingHit)}
                >
                  Restock instead
                </button>
              </div>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <label htmlFor="product-desc" className="text-sm font-medium">
              Description{" "}
              <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="product-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {error ? (
            <p className="text-sm text-destructive sm:col-span-2" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button type="submit" disabled={pending || Boolean(existingHit)}>
              {pending ? "Adding…" : "Add product"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(SHOP_ROUTES.inventory)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
