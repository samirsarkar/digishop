"use client"

import { useState, useTransition, type FormEvent } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { SHOP_ROUTES, slugifyShopName } from "@/features/shop/constants"
import { createShopAction } from "@/features/shop/services/actions"
import type { ShopContactInput } from "@/shared/lib/validators/shop"

type FieldErrors = Partial<
  Record<"name" | "slug" | "gst" | "address" | "phone" | "email" | "form", string>
>

export function OnboardingForm() {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugTouched, setSlugTouched] = useState(false)
  const [gst, setGst] = useState("")
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})

  function onNameChange(value: string) {
    setName(value)
    if (!slugTouched) {
      setSlug(slugifyShopName(value))
    }
  }

  function buildContacts(): ShopContactInput[] {
    const contacts: ShopContactInput[] = []
    if (phone.trim()) {
      contacts.push({ type: "phone", value: phone.trim(), isPrimary: true })
    }
    if (email.trim()) {
      contacts.push({
        type: "email",
        value: email.trim(),
        isPrimary: !phone.trim(),
      })
    }
    return contacts
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrors({})

    startTransition(async () => {
      const result = await createShopAction({
        name,
        slug,
        gst,
        address,
        contacts: buildContacts(),
      })

      if (!result.ok) {
        setErrors({ form: result.error.message })
        return
      }

      router.push(SHOP_ROUTES.dashboard)
      router.refresh()
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="shop-name" className="text-sm font-medium">
          Shop name
        </label>
        <input
          id="shop-name"
          name="name"
          required
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="e.g. Shree Kirana Store"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="shop-slug" className="text-sm font-medium">
          Shop URL
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">/shop/</span>
          <input
            id="shop-slug"
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value.toLowerCase())
            }}
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            placeholder="shree-kirana"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="shop-phone" className="text-sm font-medium">
          Phone <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="shop-phone"
          name="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="+91 98765 43210"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="shop-email" className="text-sm font-medium">
          Email <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="shop-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="shop@example.com"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="shop-gst" className="text-sm font-medium">
          GSTIN <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="shop-gst"
          name="gst"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="22AAAAA0000A1Z5"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="shop-address" className="text-sm font-medium">
          Address <span className="text-muted-foreground">(optional)</span>
        </label>
        <textarea
          id="shop-address"
          name="address"
          rows={3}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          placeholder="Shop no., street, city"
        />
      </div>

      {errors.form ? (
        <p className="text-sm text-destructive" role="alert">
          {errors.form}
        </p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Creating shop…" : "Create shop"}
      </Button>
    </form>
  )
}
