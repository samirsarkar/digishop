"use client"

import { useState, useTransition, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCart } from "@/features/storefront/components/cart-provider"
import { QuantityStepper } from "@/features/storefront/components/quantity-stepper"
import { placeCustomerOrderAction } from "@/features/storefront/services/actions"
import { formatInr } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

const fieldClass =
  "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"

export function CheckoutForm({
  shopSlug,
  shopName,
}: {
  shopSlug: string
  shopName: string
}) {
  const router = useRouter()
  const { lines, subtotal, setQuantity, removeItem, clear } = useCart()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (lines.length === 0) {
      setError("Your cart is empty")
      return
    }
    setError(null)

    startTransition(async () => {
      const result = await placeCustomerOrderAction({
        shopSlug,
        customerName: name,
        customerPhone: phone,
        notes,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      })

      if (!result.ok) {
        setError(result.error.message)
        return
      }

      clear()
      router.push(`/shop/${shopSlug}/order/${result.data.id}`)
    })
  }

  if (lines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your cart is empty</CardTitle>
          <CardDescription>
            Add items from {shopName} before checking out.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href={`/shop/${shopSlug}`}
            className={cn(buttonVariants())}
          >
            Continue shopping
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-5">
        <Link
          href={`/shop/${shopSlug}`}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 text-muted-foreground"
          )}
        >
          ← Continue shopping
        </Link>
      </div>
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Your items</CardTitle>
          <CardDescription>Pay when you pick up at the shop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ul className="divide-y rounded-lg border">
            {lines.map((line) => (
              <li
                key={line.productId}
                className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{line.name}</p>
                  <p className="font-numeric text-sm text-muted-foreground">
                    {formatInr(line.price)} each
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <QuantityStepper
                    quantity={line.quantity}
                    maxQuantity={line.maxQuantity}
                    onChange={(next) => setQuantity(line.productId, next)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(line.productId)}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="font-numeric text-right text-lg font-semibold">
            Total {formatInr(subtotal)}
          </p>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Pickup details</CardTitle>
          <CardDescription>
            We&apos;ll reserve your items. Pay at the counter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="customer-name" className="text-sm font-medium">
                Your name
              </label>
              <input
                id="customer-name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customer-phone" className="text-sm font-medium">
                Phone
              </label>
              <input
                id="customer-phone"
                required
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
                placeholder="+91 …"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="customer-notes" className="text-sm font-medium">
                Notes <span className="text-muted-foreground">(optional)</span>
              </label>
              <textarea
                id="customer-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                placeholder="Preferred pickup time, etc."
              />
            </div>
            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? "Placing order…" : "Place order · pay at pickup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
