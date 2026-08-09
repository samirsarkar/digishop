"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type CartLine = {
  productId: string
  name: string
  price: number
  quantity: number
  maxQuantity: number
  imageUrl?: string | null
}

type CartContextValue = {
  shopSlug: string
  lines: CartLine[]
  itemCount: number
  subtotal: number
  addItem: (line: Omit<CartLine, "quantity"> & { quantity?: number }) => void
  setQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clear: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function storageKey(shopSlug: string) {
  return `digishop-cart:${shopSlug}`
}

export function CartProvider({
  shopSlug,
  children,
}: {
  shopSlug: string
  children: ReactNode
}) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      try {
        const raw = localStorage.getItem(storageKey(shopSlug))
        if (raw) {
          const parsed = JSON.parse(raw) as CartLine[]
          if (Array.isArray(parsed)) setLines(parsed)
        }
      } catch {
        // ignore corrupt cart
      }
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [shopSlug])

  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(storageKey(shopSlug), JSON.stringify(lines))
  }, [hydrated, lines, shopSlug])

  const addItem = useCallback(
    (line: Omit<CartLine, "quantity"> & { quantity?: number }) => {
      const qty = line.quantity ?? 1
      setLines((prev) => {
        const existing = prev.find((item) => item.productId === line.productId)
        if (!existing) {
          return [
            ...prev,
            {
              ...line,
              quantity: Math.min(qty, line.maxQuantity),
            },
          ]
        }
        return prev.map((item) =>
          item.productId === line.productId
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + qty,
                  item.maxQuantity
                ),
              }
            : item
        )
      })
    },
    []
  )

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                quantity: Math.min(Math.max(quantity, 0), item.maxQuantity),
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }, [])

  const removeItem = useCallback((productId: string) => {
    setLines((prev) => prev.filter((item) => item.productId !== productId))
  }, [])

  const clear = useCallback(() => setLines([]), [])

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0)
    const subtotal = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    )
    return {
      shopSlug,
      lines,
      itemCount,
      subtotal,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }
  }, [addItem, clear, lines, removeItem, setQuantity, shopSlug])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider")
  }
  return ctx
}
