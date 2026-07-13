"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import JsBarcode from "jsbarcode"
import { Printer } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { SHOP_ROUTES } from "@/features/shop/constants"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

type BarcodePrintSectionProps = {
  products: ProductWithStock[]
}

export function BarcodePrintSection({ products }: BarcodePrintSectionProps) {
  const printable = useMemo(
    () =>
      products.filter((product) => Boolean(product.barcode || product.sku)),
    [products]
  )
  const [selected, setSelected] = useState<string[]>(() =>
    printable.slice(0, 12).map((p) => p.id)
  )

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function selectAll() {
    setSelected(printable.map((p) => p.id))
  }

  const selectedProducts = printable.filter((p) => selected.includes(p.id))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between print:hidden">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Barcodes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate printable Code128 labels from product barcode or SKU values.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={SHOP_ROUTES.inventory}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Back to products
          </Link>
          <Button type="button" onClick={() => window.print()} disabled={selectedProducts.length === 0}>
            <Printer className="size-4" />
            Print labels
          </Button>
        </div>
      </div>

      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Select products</CardTitle>
          <CardDescription>
            Products need a barcode or SKU. Add missing codes from{" "}
            <Link href={SHOP_ROUTES.addProduct} className="underline underline-offset-2">
              Add product
            </Link>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {printable.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No products with barcode/SKU yet.
            </p>
          ) : (
            <>
              <Button type="button" variant="outline" size="sm" onClick={selectAll}>
                Select all ({printable.length})
              </Button>
              <ul className="divide-y rounded-lg border">
                {printable.map((product) => {
                  const code = product.barcode || product.sku || ""
                  return (
                    <li key={product.id} className="flex items-center gap-3 px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selected.includes(product.id)}
                        onChange={() => toggle(product.id)}
                        id={`bc-${product.id}`}
                        className="size-4"
                      />
                      <label htmlFor={`bc-${product.id}`} className="min-w-0 flex-1 cursor-pointer">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {code} · {formatInr(product.price)}
                        </p>
                      </label>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </CardContent>
      </Card>

      <div className="print-area grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {selectedProducts.map((product) => (
          <BarcodeLabel
            key={product.id}
            name={product.name}
            code={product.barcode || product.sku || ""}
            price={formatInr(product.price)}
          />
        ))}
      </div>
    </div>
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

  useEffect(() => {
    if (!svgRef.current || !code) return
    try {
      JsBarcode(svgRef.current, code, {
        format: "CODE128",
        width: 1.4,
        height: 48,
        displayValue: true,
        fontSize: 12,
        margin: 4,
      })
    } catch {
      // Invalid characters for CODE128 — show raw text instead
    }
  }, [code])

  return (
    <div className="break-inside-avoid rounded-lg border bg-white p-3 text-black">
      <p className="mb-2 line-clamp-2 text-center text-xs font-medium">{name}</p>
      <svg ref={svgRef} className="mx-auto max-w-full" />
      <p className="mt-1 text-center text-xs font-semibold">{price}</p>
    </div>
  )
}
