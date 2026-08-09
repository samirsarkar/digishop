"use client"

import { useState } from "react"

import { ProductForm } from "@/features/inventory/components/product-form"
import { RestockForm } from "@/features/inventory/components/restock-form"
import type { ProductWithStock } from "@/features/inventory/services/products"
import { cn } from "@/lib/utils"

type Mode = "new" | "restock"

type ProductIntakeProps = {
  shopId: string
  categories: string[]
}

export function ProductIntake({ shopId, categories }: ProductIntakeProps) {
  const [mode, setMode] = useState<Mode>("new")
  const [restockProduct, setRestockProduct] =
    useState<ProductWithStock | null>(null)

  function switchToRestock(product?: ProductWithStock | null) {
    if (product) setRestockProduct(product)
    setMode("restock")
  }

  return (
    <div className="space-y-6">
      <div
        className="flex gap-1 rounded-lg border bg-muted/40 p-1"
        role="tablist"
        aria-label="Add or restock"
      >
        <ModeTab
          active={mode === "new"}
          onClick={() => setMode("new")}
          label="New product"
        />
        <ModeTab
          active={mode === "restock"}
          onClick={() => switchToRestock()}
          label="Restock"
        />
      </div>

      {mode === "new" ? (
        <ProductForm
          shopId={shopId}
          categories={categories}
          onSwitchToRestock={switchToRestock}
        />
      ) : (
        <RestockForm
          key={restockProduct?.id ?? "restock"}
          shopId={shopId}
          initialProduct={restockProduct}
          onCleared={() => setRestockProduct(null)}
        />
      )}
    </div>
  )
}

function ModeTab({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-xs"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </button>
  )
}
