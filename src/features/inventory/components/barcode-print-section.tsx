"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import JsBarcode from "jsbarcode"
import QRCode from "qrcode"
import { Printer, Search } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  allocateNextBarcodeAction,
  updateProductAction,
} from "@/features/inventory/services/actions"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { generateProductSku, SHOP_ROUTES } from "@/features/shop/constants"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

type BarcodePrintSectionProps = {
  shopId: string
  products: ProductWithStock[]
}

export function BarcodePrintSection({
  shopId,
  products: initial,
}: BarcodePrintSectionProps) {
  const [products, setProducts] = useState(initial)
  const [query, setQuery] = useState("")
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copies, setCopies] = useState<Record<string, number>>({})

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku?.toLowerCase().includes(q) ?? false) ||
        (p.barcode?.toLowerCase().includes(q) ?? false) ||
        (p.category?.toLowerCase().includes(q) ?? false)
    )
  }, [products, query])

  const printable = useMemo(
    () => filtered.filter((product) => Boolean(product.barcode || product.sku)),
    [filtered]
  )

  const printableIds = useMemo(
    () => printable.map((product) => product.id),
    [printable]
  )

  const [selectedOverride, setSelectedOverride] = useState<string[] | null>(
    null
  )

  const selected = useMemo(() => {
    if (selectedOverride === null) {
      return printableIds.slice(0, 12)
    }
    const ids = new Set(printableIds)
    const kept = selectedOverride.filter((id) => ids.has(id))
    return kept.length > 0 ? kept : printableIds.slice(0, 12)
  }, [selectedOverride, printableIds])

  function copiesFor(id: string) {
    const n = copies[id] ?? 1
    return Math.min(99, Math.max(1, n))
  }

  function setCopiesFor(id: string, value: number) {
    const n = Number.isFinite(value) ? Math.min(99, Math.max(1, Math.floor(value))) : 1
    setCopies((prev) => ({ ...prev, [id]: n }))
  }

  function toggle(id: string) {
    setSelectedOverride((prev) => {
      const current = prev ?? selected
      return current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id]
    })
  }

  function selectAll() {
    setSelectedOverride(printable.map((p) => p.id))
  }

  function saveCode(productId: string, barcode: string, sku: string) {
    setError(null)
    startTransition(async () => {
      const result = await updateProductAction({
        productId,
        barcode,
        sku,
      })
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, barcode: result.data.barcode, sku: result.data.sku }
            : p
        )
      )
    })
  }

  function generateBarcode(
    productId: string,
    onBarcode: (code: string) => void
  ) {
    setError(null)
    startTransition(async () => {
      const result = await allocateNextBarcodeAction(shopId)
      if (!result.ok) {
        setError(result.error.message)
        return
      }
      onBarcode(result.data.barcode)
    })
  }

  const labelSheets = useMemo(() => {
    const sheets: {
      key: string
      name: string
      code: string
      price: string
    }[] = []
    for (const product of printable) {
      if (!selected.includes(product.id)) continue
      const code = product.barcode || product.sku || ""
      if (!code) continue
      const n = copiesFor(product.id)
      for (let i = 0; i < n; i += 1) {
        sheets.push({
          key: `${product.id}-${i}`,
          name: product.name,
          code,
          price: formatInr(product.price),
        })
      }
    }
    return sheets
    // copiesFor reads copies state
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [printable, selected, copies])

  const totalLabels = labelSheets.length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Labels</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            One unique barcode per product. Generate sequential DigiShop codes
            (DS00000001…), then print as many identical labels as you need.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={SHOP_ROUTES.inventory}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to products
          </Link>
          <Button
            type="button"
            onClick={() => window.print()}
            disabled={totalLabels === 0}
          >
            <Printer className="size-4" />
            Print {totalLabels > 0 ? `${totalLabels} labels` : "labels"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="print:hidden text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            Search, assign a unique barcode or SKU, set copies, then print.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="flex h-10 w-full rounded-lg border border-input py-2 pr-3 pl-9 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products match.</p>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={selectAll}
                disabled={printable.length === 0}
              >
                Select printable ({printable.length})
              </Button>
              <ul className="divide-y rounded-lg border">
                {filtered.map((product) => (
                  <LabelEditorRow
                    key={`${product.id}-${product.barcode ?? ""}-${product.sku ?? ""}`}
                    product={product}
                    checked={selected.includes(product.id)}
                    copies={copiesFor(product.id)}
                    disabled={pending}
                    onToggle={() => toggle(product.id)}
                    onCopiesChange={(n) => setCopiesFor(product.id, n)}
                    onGenerateBarcode={(apply) =>
                      generateBarcode(product.id, apply)
                    }
                    onSave={saveCode}
                  />
                ))}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <div className="print-area grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {labelSheets.map((sheet) => (
          <BarcodeLabel
            key={sheet.key}
            name={sheet.name}
            code={sheet.code}
            price={sheet.price}
          />
        ))}
      </div>
    </div>
  )
}

function LabelEditorRow({
  product,
  checked,
  copies,
  disabled,
  onToggle,
  onCopiesChange,
  onGenerateBarcode,
  onSave,
}: {
  product: ProductWithStock
  checked: boolean
  copies: number
  disabled: boolean
  onToggle: () => void
  onCopiesChange: (n: number) => void
  onGenerateBarcode: (apply: (code: string) => void) => void
  onSave: (productId: string, barcode: string, sku: string) => void
}) {
  const [barcode, setBarcode] = useState(product.barcode ?? "")
  const [sku, setSku] = useState(product.sku ?? "")

  return (
    <li className="space-y-2 px-3 py-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={checked}
          onChange={onToggle}
          disabled={!barcode && !sku}
          id={`bc-${product.id}`}
          className="mt-1 size-4"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <label htmlFor={`bc-${product.id}`} className="block cursor-pointer">
            <p className="truncate text-sm font-medium">{product.name}</p>
            <p className="font-numeric text-xs text-muted-foreground">
              {formatInr(product.price)}
            </p>
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex gap-1">
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Barcode"
                className="h-8 min-w-0 flex-1 rounded-md border border-input px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                title="Generate sequential DigiShop barcode"
                onClick={() => onGenerateBarcode(setBarcode)}
              >
                Gen
              </Button>
            </div>
            <div className="flex gap-1">
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="SKU"
                className="h-8 min-w-0 flex-1 rounded-md border border-input px-2 text-sm"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                title="Generate SKU"
                onClick={() => setSku(generateProductSku())}
              >
                SKU
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label
              htmlFor={`copies-${product.id}`}
              className="text-xs text-muted-foreground"
            >
              Copies
            </label>
            <input
              id={`copies-${product.id}`}
              type="number"
              min={1}
              max={99}
              value={copies}
              disabled={!checked || (!barcode && !sku)}
              onChange={(e) => onCopiesChange(Number(e.target.value))}
              className="font-numeric h-8 w-16 rounded-md border border-input px-2 text-sm"
            />
            <Button
              type="button"
              size="xs"
              variant="secondary"
              disabled={disabled}
              onClick={() => onSave(product.id, barcode, sku)}
            >
              Save codes
            </Button>
          </div>
        </div>
      </div>
    </li>
  )
}

function BarcodeLabel({
  name,
  code,
  price,
}: {
  name: string
  code: string
  price: string
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!svgRef.current || !code) return
    try {
      JsBarcode(svgRef.current, code, {
        format: "CODE128",
        width: 1.4,
        height: 40,
        displayValue: true,
        fontSize: 11,
        margin: 4,
      })
    } catch {
      // Invalid characters for CODE128
    }
  }, [code])

  useEffect(() => {
    if (!code) return
    let cancelled = false
    QRCode.toDataURL(code, { margin: 1, width: 96, errorCorrectionLevel: "M" })
      .then((url) => {
        if (!cancelled) setQrUrl(url)
      })
      .catch(() => {
        if (!cancelled) setQrUrl(null)
      })
    return () => {
      cancelled = true
    }
  }, [code])

  const displayQr = code ? qrUrl : null

  return (
    <div className="break-inside-avoid rounded-lg border bg-white p-3 text-black">
      <p className="mb-2 line-clamp-2 text-center text-xs font-medium">{name}</p>
      <svg ref={svgRef} className="mx-auto max-w-full" />
      {displayQr ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={displayQr} alt="" className="mx-auto mt-2 size-20" />
      ) : null}
      <p className="font-numeric mt-1 text-center text-xs font-semibold tracking-wide">
        {price}
      </p>
    </div>
  )
}
