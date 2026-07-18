import Link from "next/link"
import {
  BarChart3,
  Camera,
  CreditCard,
  MapPin,
  Package,
  QrCode,
  ScanLine,
  Shield,
  ShoppingBag,
  Smartphone,
  Store,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  AuthCtaLink,
  SignedOutLink,
} from "@/features/auth/components/auth-cta-link"
import { AuthHeaderControls } from "@/features/auth/components/auth-header-controls"
import { AUTH_ROUTES } from "@/features/auth/constants"
import { RUPEE } from "@/shared/lib/money"
import { cn } from "@/lib/utils"

const pillars = [
  {
    icon: ScanLine,
    title: "In-Store Operations",
    description:
      "Replace legacy POS hardware with your phone. Scan barcodes, manage stock, and check out customers from the shop floor.",
    highlights: [
      "Camera-based barcode & QR scanning",
      "Mobile checkout at the counter",
      "Real-time inventory & low-stock alerts",
    ],
  },
  {
    icon: ShoppingBag,
    title: "Customer Experience",
    description:
      "Give shoppers a fast, app-like web experience — browse live inventory, order ahead, and pick up in store.",
    highlights: [
      "Live inventory browsing from any device",
      "Pre-pay online or reserve with pay-later",
      "QR code receipt for frictionless pickup",
    ],
  },
  {
    icon: MapPin,
    title: "Digital Presence",
    description:
      "Be discoverable on Google Maps and Search. One tap from your Business listing opens your mobile storefront.",
    highlights: [
      "Google Maps & Search discoverability",
      "Mobile-optimized — no app store required",
      "UPI, cards, and digital wallet payments",
    ],
  },
]

const roles = [
  {
    icon: Shield,
    badge: "Owner",
    title: "The Strategist",
    description:
      "Full access to P&L, profit margins, revenue, shop settings, and team management.",
  },
  {
    icon: Store,
    badge: "Manager",
    title: "The Operator",
    description:
      "Run the floor — scan items, manage stock, process sales, and update order statuses without sensitive financials.",
  },
  {
    icon: Users,
    badge: "Customer",
    title: "The Buyer",
    description:
      "Browse products, track orders, view history, and manage payment profiles in a clean, simple interface.",
  },
]

const stats = [
  { value: "1", label: "App for staff & customers" },
  { value: "0", label: "Dedicated scanners needed" },
  { value: "24/7", label: "Live storefront online" },
]

export function LandingPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Smartphone className="size-4" />
            </div>
            <span className="font-semibold tracking-tight">DigiShop</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
            <a
              href="#pillars"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#roles"
              className="transition-colors hover:text-foreground"
            >
              Roles
            </a>
            <a
              href="#checkout"
              className="transition-colors hover:text-foreground"
            >
              Checkout
            </a>
          </nav>
          <AuthHeaderControls />
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,oklch(0.72_0.14_162/0.18),transparent)]" />
          <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-4">
                Mobile-first retail platform
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                The Pocket-Powered{" "}
                <span className="text-primary">Smart Shop</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Bridge physical retail and digital convenience with one cohesive
                app. Run your shop floor from a phone, give customers a
                lightning-fast storefront — no app store download required.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <AuthCtaLink
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "w-full sm:w-auto",
                  )}
                  signedInLabel="Go to Dashboard"
                >
                  Start Free Trial
                </AuthCtaLink>
                <Link
                  href="#pillars"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "w-full sm:w-auto",
                  )}
                >
                  See How It Works
                </Link>
              </div>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border bg-card/50 px-6 py-5 text-center"
                >
                  <p className="font-numeric text-3xl font-bold text-primary">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pillars"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Three pillars, one platform
            </h2>
            <p className="mt-4 text-muted-foreground">
              Everything your shop needs — from scanning stock to serving
              customers online — built for the pocket first, scaling to desktop
              for heavy admin work.
            </p>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <Card key={pillar.title} className="h-full">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <pillar.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg">{pillar.title}</CardTitle>
                  <CardDescription>{pillar.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {pillar.highlights.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-primary">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div>
                <Badge variant="outline" className="mb-4">
                  Merchant tools
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Your phone is the new POS
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Walk the shop with a smartphone or tablet. Scan incoming
                  stock, build carts at checkout, and watch analytics update in
                  real time — inventory levels, daily P&amp;L, and sales trends
                  included.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                    <Camera className="size-4 text-primary" />
                    Barcode scanning
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                    <QrCode className="size-4 text-primary" />
                    Custom QR labels
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                    <BarChart3 className="size-4 text-primary" />
                    Live dashboard
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm">
                    <Package className="size-4 text-primary" />
                    Stock alerts
                  </div>
                </div>
              </div>

              <Card className="border-primary/20 bg-card shadow-lg">
                <CardHeader>
                  <CardTitle>Today&apos;s snapshot</CardTitle>
                  <CardDescription>
                    Sample owner dashboard preview
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Revenue today
                    </span>
                    <span className="font-numeric text-lg font-semibold">
                      {RUPEE}12,480
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Orders fulfilled
                    </span>
                    <span className="font-numeric text-lg font-semibold">
                      47
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3">
                    <span className="text-sm text-muted-foreground">
                      Low-stock items
                    </span>
                    <span className="font-numeric text-lg font-semibold text-destructive">
                      3
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section
          id="checkout"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20"
        >
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Flexible checkout for customers
            </h2>
            <p className="mt-4 text-muted-foreground">
              Customers browse live inventory from home or on the go, then
              choose how they want to pay and pick up.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </div>
                <CardTitle>Pre-paid pickup</CardTitle>
                <CardDescription>
                  Pay instantly via UPI, cards, or digital wallets. Receive a
                  secure QR receipt, walk in, show the code, and leave with your
                  order.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShoppingBag className="size-5" />
                </div>
                <CardTitle>Pay later / COD</CardTitle>
                <CardDescription>
                  Reserve items online so they don&apos;t sell out. Pay with
                  cash or digital payment at the counter when you pick up.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section id="roles" className="border-t bg-muted/40">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Built for every role
              </h2>
              <p className="mt-4 text-muted-foreground">
                Secure, role-based access keeps financial data with owners while
                managers and customers get exactly what they need.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {roles.map((role) => (
                <Card key={role.badge} className="text-center">
                  <CardHeader className="items-center">
                    <Badge variant="secondary">{role.badge}</Badge>
                    <div className="mt-3 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <role.icon className="size-6" />
                    </div>
                    <CardTitle>{role.title}</CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-6 px-6 py-12 text-center sm:px-12 sm:py-16">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to power your shop from your pocket?
              </h2>
              <p className="max-w-xl text-primary-foreground/80">
                Join the next generation of local retail. Mobile operations for
                staff, a seamless storefront for customers — all in one place.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <AuthCtaLink
                  className={cn(
                    buttonVariants({ size: "lg", variant: "secondary" }),
                    "w-full sm:w-auto",
                  )}
                  signedInLabel="Go to Dashboard"
                >
                  Create Your Shop
                </AuthCtaLink>
                <SignedOutLink
                  href={AUTH_ROUTES.signIn}
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "w-full border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto",
                  )}
                >
                  Sign In
                </SignedOutLink>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Smartphone className="size-3.5" />
            </div>
            <span className="text-sm font-medium">DigiShop</span>
          </div>
          <p className="text-sm text-muted-foreground">
            The pocket-powered smart shop.
          </p>
        </div>
        <Separator />
        <p className="py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} DigiShop. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
