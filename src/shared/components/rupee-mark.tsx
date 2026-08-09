import { RUPEE } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

/**
 * Renders the Indian Rupee sign with a font that includes U+20B9.
 * Always use this (or formatInr) — never put a raw ₹ in native <option> text
 * (system UI fonts often show a broken glyph).
 */
export function RupeeMark({ className }: { className?: string }) {
  return (
    <span className={cn("font-numeric", className)} aria-hidden="true">
      {RUPEE}
    </span>
  )
}
