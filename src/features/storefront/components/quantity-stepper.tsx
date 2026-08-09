"use client"

import { Minus, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function QuantityStepper({
  quantity,
  maxQuantity,
  onChange,
  size = "sm",
  className,
}: {
  quantity: number
  maxQuantity: number
  onChange: (next: number) => void
  size?: "sm" | "default"
  className?: string
}) {
  const atMin = quantity <= 0
  const atMax = quantity >= maxQuantity
  const buttonSize = size === "sm" ? "icon-sm" : "icon"

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        disabled={atMin}
        aria-label="Decrease quantity"
        onClick={() => onChange(quantity - 1)}
      >
        <Minus className="size-3.5" />
      </Button>
      <span
        className={cn(
          "font-numeric min-w-7 text-center text-sm font-semibold tabular-nums",
          size === "default" && "min-w-8 text-base"
        )}
      >
        {quantity}
      </span>
      <Button
        type="button"
        variant="outline"
        size={buttonSize}
        disabled={atMax || maxQuantity <= 0}
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
      >
        <Plus className="size-3.5" />
      </Button>
    </div>
  )
}
