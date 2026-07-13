"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import { LayoutDashboard, Package, Smartphone } from "lucide-react"

import { cn } from "@/lib/utils"
import { SHOP_ROUTES } from "@/features/shop/constants"

const navItems = [
  { href: SHOP_ROUTES.dashboard, label: "Overview", icon: LayoutDashboard },
  { href: SHOP_ROUTES.inventory, label: "Products", icon: Package },
] as const

export function MerchantShell({
  children,
  shopName,
}: {
  children: React.ReactNode
  shopName?: string
}) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-4 sm:gap-8">
            <Link href={SHOP_ROUTES.dashboard} className="flex shrink-0 items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Smartphone className="size-4" />
              </div>
              <span className="hidden font-semibold tracking-tight sm:inline">
                DigiShop
              </span>
            </Link>
            <nav className="flex items-center gap-1">
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
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-muted font-medium text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3.5" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {shopName ? (
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
                {shopName}
              </span>
            ) : null}
            <UserButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}
