"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, useAuth } from "@clerk/nextjs"
import {
  ClipboardList,
  LayoutDashboard,
  Package,
  Receipt,
  Smartphone,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { SHOP_ROUTES } from "@/features/shop/constants"

const navItems = [
  { href: SHOP_ROUTES.dashboard, label: "Overview", icon: LayoutDashboard },
  { href: SHOP_ROUTES.orders, label: "Orders", icon: ClipboardList },
  { href: SHOP_ROUTES.inventory, label: "Products", icon: Package },
  { href: SHOP_ROUTES.pos, label: "Billing", icon: Receipt },
] as const

export function MerchantShell({
  children,
  shopName,
}: {
  children: React.ReactNode
  shopName?: string
}) {
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useAuth()

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
            <Link
              href={SHOP_ROUTES.dashboard}
              className="flex shrink-0 items-center gap-2"
            >
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Smartphone className="size-4" />
              </div>
              <span className="hidden font-semibold tracking-tight sm:inline">
                DigiShop
              </span>
            </Link>
            <nav
              className="-mx-1 flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Merchant"
            >
              {navItems.map((item) => {
                const active =
                  item.href === SHOP_ROUTES.dashboard
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors sm:px-2.5",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5 shrink-0" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {shopName ? (
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:inline">
                {shopName}
              </span>
            ) : null}
            {!isLoaded ? (
              <div
                className="size-8 shrink-0 animate-pulse rounded-full bg-muted"
                aria-hidden
              />
            ) : isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "size-8",
                  },
                }}
              />
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}
