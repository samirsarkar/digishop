# DigiShop — Project Plan & Architecture

> **Audience:** Founder-developer building on a tight budget  
> **Last updated:** July 2026  
> **Status:** Foundation in progress (auth scaffolded, landing page live)

---

## Table of Contents

1. [Project Understanding](#1-project-understanding)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [Complete Requirements](#4-complete-requirements)
5. [Services & Pricing (Free / Low-Cost)](#5-services--pricing-free--low-cost)
6. [Step-by-Step Execution Plan](#6-step-by-step-execution-plan)
7. [Time Estimates](#7-time-estimates)
8. [Current State vs. Remaining Work](#8-current-state-vs-remaining-work)

---

## 1. Project Understanding

### What DigiShop Is

DigiShop is a **mobile-first retail operating platform** for Indian small shop owners. One web app serves three roles:

| Role | Who | What they do |
|------|-----|--------------|
| **Owner** | Shop proprietor | Full P&L, profit margins, revenue, shop settings, team management |
| **Manager** | Floor staff | Scan items, manage stock, process sales, update order status — no sensitive financials |
| **Customer** | Shopper | Browse products, place orders, track history, pay online or at pickup |

### Three Core Pillars

1. **In-Store Operations** — Camera barcode scanning, mobile checkout, stock alerts, real-time inventory
2. **Customer Storefront** — Live inventory browsing, online pre-pay (UPI/cards) or COD reserve, QR receipt pickup
3. **Digital Presence** — Discoverable via Google Maps/Search, no app store download required

### Design Principles

- **Mobile-first** — Staff run the shop from a phone; customers browse on any device
- **Single codebase** — Next.js App Router, feature-based modules
- **Bootstrapped** — Free tiers for hosting, auth, DB, and email until real traction
- **India-focused payments** — UPI-first via Razorpay (0% UPI fees)

### What Is Already Built

| Area | Status |
|------|--------|
| Next.js 16 + React 19 + Tailwind v4 + shadcn/ui | Done |
| Landing page (marketing) | Done |
| Clerk auth (`ClerkProvider`, sign-in/sign-up, middleware) | Done |
| Protected `/dashboard` shell | Done |
| Feature module: `auth/` | Done |
| Database, inventory, POS, storefront, payments | Schema + API scaffold done; needs `DATABASE_URL` |

---

## 2. Frontend Architecture

### Directory Layout

```
src/
├── app/                         # Next.js App Router (routing only)
│   ├── layout.tsx               # Root layout + ClerkProvider
│   ├── page.tsx                 # Landing page shell
│   ├── sign-in/[[...sign-in]]/  # Clerk catch-all
│   ├── sign-up/[[...sign-up]]/  # Clerk catch-all
│   ├── dashboard/               # Protected owner/manager area
│   │   ├── page.tsx             # Dashboard home
│   │   ├── inventory/           # Product management
│   │   ├── pos/                 # In-store checkout
│   │   ├── orders/              # Order management
│   │   └── analytics/           # Charts & P&L
│   └── shop/[shopSlug]/         # Public customer storefront
│       ├── page.tsx             # Product listing
│       └── checkout/            # Customer checkout flow
│
├── features/                    # Business logic modules
│   ├── auth/                    # ✅ Built
│   ├── shop/                    # Shop profile & settings
│   ├── inventory/               # Products, stock, barcode scan
│   ├── pos/                     # Cart, in-store transactions
│   ├── orders/                  # Order lifecycle management
│   ├── storefront/              # Customer-facing browsing
│   ├── payments/                # Razorpay integration
│   └── analytics/               # Revenue, P&L, reports
│
├── components/ui/               # shadcn/ui primitives (existing)
├── shared/                      # Cross-feature hooks/utils (new shared code)
├── lib/                         # Low-level helpers (cn, db client)
│
└── proxy.ts                     # ✅ Clerk middleware (route protection)
```

> **Placement rule (matches `.cursorrules` + `docs/FILEMAP.md`):**  
> - UI primitives → `src/components/ui/`  
> - Cross-feature hooks/utils → `src/shared/`  
> - Low-level helpers → `src/lib/`  
> Do **not** nest `components/ui` or `lib` under `shared/`.


### Rendering Strategy

| Route | Strategy | Why |
|-------|----------|-----|
| `/` (landing) | Static (SSG) | No user data, SEO |
| `/dashboard/**` | Server Components + Server Actions | Auth-gated, data-heavy |
| `/dashboard/pos` | Client Component | Real-time camera, cart state |
| `/shop/[slug]` | ISR (revalidate ~60s) | Public, SEO-able, semi-dynamic |
| `/shop/[slug]/checkout` | Client + Server Action | Payment flow |

### Key Frontend Libraries

| Package | Purpose | Cost |
|---------|---------|------|
| `@clerk/nextjs` + `@clerk/ui` | Auth UI & session | Free tier |
| `@base-ui/react` | UI primitives (shadcn base) | Free |
| `@zxing/browser` | Camera barcode scanner | Free |
| `react-hook-form` + `zod` | Forms & validation | Free |
| `@tanstack/react-query` | Client data fetching | Free |
| `recharts` | Analytics charts | Free |
| `qrcode` | QR receipt generation | Free |
| `nuqs` | URL state (filters) | Free |
| `date-fns` | Date formatting | Free |

---

## 3. Backend Architecture

DigiShop uses **Next.js Server Actions + API Routes** — no separate backend server. This keeps hosting cost at **$0** on the free tier.

```
Database (Neon Postgres)
        │
        ▼
   Drizzle ORM  ◄──── Schema & type safety
        │
        ├── Server Actions      ← mutations (create product, process sale)
        ├── API Routes          ← webhooks (Clerk, Razorpay), public shop API
        └── Server Components   ← data fetching (dashboard, analytics)
```

### Core Data Model

```
shops          → id, ownerId (Clerk userId), name, slug, gst, address
shop_contacts  → shopId, type (phone|email|whatsapp|website|instagram|facebook|other), value, label, isPrimary
users          → clerkId, shopId, role (owner|manager|customer)
products       → id, shopId, name, sku, barcode, price, costPrice, imageUrl
inventory      → productId, shopId, quantity, lowStockThreshold
orders         → id, shopId, customerId, status, totalAmount, paymentMethod
order_items    → orderId, productId, quantity, unitPrice
transactions   → orderId, razorpayOrderId, status, amount, paidAt
```

### Integrations

| Service | Purpose | SDK / Package |
|---------|---------|---------------|
| Clerk | Auth, user management | `@clerk/nextjs` ✅ |
| Neon | Postgres database | `@neondatabase/serverless` |
| Drizzle ORM | DB queries + migrations | `drizzle-orm`, `drizzle-kit` |
| Razorpay | UPI / card payments | `razorpay` |
| Cloudinary | Product image uploads | `next-cloudinary` |
| Resend | Order confirmation emails | `resend` |

### Auth Flow

- **Public routes:** `/`, `/sign-in`, `/sign-up`
- **Protected routes:** Everything else (middleware in `src/proxy.ts`)
- **Post-login redirect:** `/dashboard`
- **Phone vs email:** Configured in Clerk Dashboard (no code change required)

---

## 4. Complete Requirements

### Phase 0 — Foundation

- [ ] `.env.local` with Clerk keys; verify sign-in/sign-up end-to-end
- [ ] Neon database (free tier) — staging + production branches
- [x] Drizzle ORM schema + db scripts (`pnpm db:push` / `db:migrate`)
- [x] Shop onboarding (new user → create shop → dashboard)
- [x] Core feature API scaffold (inventory, orders, POS, storefront, payments stub, analytics)

### Phase 1 — Inventory

- [ ] Product CRUD (add, edit, delete)
- [ ] Product image upload (Cloudinary)
- [ ] Barcode/QR scanner (`@zxing/browser`)
- [ ] Scan-to-find product
- [ ] Low-stock threshold alerts
- [ ] Bulk CSV import (optional)

### Phase 2 — POS & In-Store Checkout

- [ ] Cart builder (scan or search)
- [ ] Checkout screen (total, discount, payment method)
- [ ] Cash sale recording (no gateway)
- [ ] QR receipt generation
- [ ] Persist order; decrement inventory

### Phase 3 — Customer Storefront

- [ ] Public `/shop/[slug]` (SSR, SEO)
- [ ] Product listing, search, categories
- [ ] Customer sign-up (phone OTP or email via Clerk)
- [ ] Online cart + Razorpay (UPI/cards)
- [ ] COD / pay-later reserve
- [ ] Order confirmation email (Resend)

### Phase 4 — Owner Analytics

- [ ] Daily revenue chart
- [ ] Top selling products
- [ ] P&L (revenue − cost of goods)
- [ ] Sales by payment method
- [ ] Low stock report

### Phase 5 — Roles, Teams & Polish

- [ ] Manager invite (Clerk orgs or custom roles)
- [ ] Role-based UI (owner vs manager vs customer)
- [ ] PWA manifest + service worker
- [ ] Mobile UX pass (real Android + iPhone)

### Phase 6 — Launch

- [ ] Custom domain on Vercel
- [ ] SEO for shop pages
- [ ] Error monitoring (Vercel or free Sentry)
- [ ] Pilot with 1–2 real shops
- [ ] Production deploy

---

## 5. Services & Pricing (Free / Low-Cost)

### Monthly Cost Summary

| Stage | Users | Approx. monthly cost |
|-------|-------|----------------------|
| **Launch** | 0–200 | **~₹70/month** (domain only, amortized) |
| **Early growth** | 200–2,000 | **$0–5** (possible SMS overages) |
| **Growth** | 2,000–10,000 | **~$25–50** (Clerk Pro or Vercel Pro) |
| **Scale** | 10,000+ | **~$100–150** |

> **Founder rule:** Spend **zero** on SaaS until you have real users. Only unavoidable cost at launch: **domain (~₹800/year)**.

---

### Hosting — Vercel

| Plan | Price | Notes |
|------|-------|-------|
| Hobby | **Free** | 100GB bandwidth, custom domain allowed |
| Pro | $20/mo (~₹1,670) | When you hit hobby limits |

---

### Database — Neon Postgres

| Plan | Price | Notes |
|------|-------|-------|
| Free | **$0** | 0.5 GB storage, 1 project |
| Launch | $19/mo (~₹1,590) | 10 GB, autoscale |

Free tier is enough for hundreds of shops at the start.

---

### Authentication — Clerk

| Plan | Price | Notes |
|------|-------|-------|
| Free | **$0** | 10,000 MAU |
| Pro | $25/mo (~₹2,090) | 25,000 MAU |

**SMS OTP (phone sign-up):**

- 100 free SMS/month on Clerk
- Then ~**$0.05/SMS** (~₹4.20 each)
- **Tip:** Start with **email OTP** to avoid SMS cost; add phone auth when you have paying shops

---

### Payments — Razorpay

| Type | Fee |
|------|-----|
| Setup / monthly | **Free** |
| UPI | **0%** |
| Debit / credit card | 2% per transaction |
| International cards | 3% |
| Net banking | ₹15 flat per transaction |

No monthly fee — you pay only when you earn.

---

### File Storage — Cloudinary

| Plan | Price | Notes |
|------|-------|-------|
| Free | **$0** | ~25 credits/mo (~500 image transforms) |
| Plus | $89/mo | Only at serious scale |

---

### Email — Resend

| Plan | Price | Notes |
|------|-------|-------|
| Free | **$0** | 3,000 emails/month |
| Pro | $20/mo | 50,000 emails/month |

---

### Domain

| Registrar | Price |
|-----------|-------|
| `.in` (Namecheap, etc.) | ~₹799/year |
| `.com` | ~$10/year (~₹835) |

---

### All Open-Source Libraries (Free)

| Package | Purpose |
|---------|---------|
| `drizzle-orm` + `drizzle-kit` | ORM + migrations |
| `@neondatabase/serverless` | DB client |
| `zod` | Validation |
| `react-hook-form` | Forms |
| `@tanstack/react-query` | Client fetching |
| `@zxing/browser` | Barcode scan |
| `recharts` | Charts |
| `qrcode` | QR receipts |
| `razorpay` | Payments SDK |
| `resend` | Email |
| `next-cloudinary` | Images |
| `date-fns` | Dates |
| `nuqs` | URL state |

---

## 6. Step-by-Step Execution Plan

### Phase 0 — Finish Foundation (Week 1)

1. Add Clerk keys to `.env.local`
2. Test sign-in, sign-up, protected `/dashboard`
3. Create Neon project; link via Vercel if desired
4. Install Drizzle; define schema; run migration
5. Build shop onboarding flow

**Exit criteria:** A new user can sign up, create a shop, and land on an empty dashboard.

---

### Phase 1 — Inventory Core (Weeks 2–4)

1. Product list + add/edit/delete UI
2. Cloudinary upload for product images
3. Barcode scanner component
4. Scan → find product in inventory
5. Low-stock badge on dashboard
6. (Optional) CSV bulk import

**Exit criteria:** Owner can add products with photos and scan barcodes to look them up.

---

### Phase 2 — POS & In-Store Checkout (Weeks 5–7)

1. POS cart (scan + search)
2. Checkout UI (totals, discounts)
3. Record cash sales
4. Generate QR receipt
5. Save transaction; update stock counts

**Exit criteria:** Staff can complete an in-store sale entirely from a phone.

---

### Phase 3 — Customer Storefront (Weeks 8–10)

1. Public shop page at `/shop/[slug]`
2. Browse, search, filter products
3. Customer auth (Clerk)
4. Cart + Razorpay checkout
5. COD reserve flow
6. Order confirmation email

**Exit criteria:** A customer can browse and pay online (or reserve for pickup).

---

### Phase 4 — Owner Analytics (Weeks 11–12)

1. Revenue over time chart
2. Best sellers
3. Simple P&L view
4. Payment method breakdown
5. Low stock report

**Exit criteria:** Owner sees daily sales and basic profit picture.

---

### Phase 5 — Roles & Polish (Weeks 13–14)

1. Invite managers; assign roles
2. Hide financials from managers
3. PWA install prompt
4. Test on real devices

**Exit criteria:** Owner and manager see different capabilities; app feels native on mobile.

---

### Phase 6 — Launch Prep (Week 15)

1. Connect custom domain
2. SEO metadata for shop pages
3. Monitoring / error tracking
4. Pilot with 1–2 shops
5. Production deploy

**Exit criteria:** Live URL, real shop using the product.

---

## 7. Time Estimates

### Part-time (3–4 hours/day, weekdays)

| Phase | Duration |
|-------|----------|
| Phase 0: Foundation | 1 week |
| Phase 1: Inventory | 2–3 weeks |
| Phase 2: POS | 2–3 weeks |
| Phase 3: Storefront | 2–3 weeks |
| Phase 4: Analytics | 1–2 weeks |
| Phase 5: Roles & polish | 1–2 weeks |
| Phase 6: Launch | 1 week |
| **Total** | **~10–15 weeks (~3 months)** |

### Full-time (6–8 hours/day)

| **Total** | **~6–8 weeks (~2 months)** |

### Reality buffer

Add **30–40%** for:

- Mobile camera / scanner edge cases
- Razorpay test-mode → live verification (1–2 days)
- Clerk dashboard configuration
- Bug fixes and UX iteration

---

## 8. Current State vs. Remaining Work

### Done

```
✅ Next.js 16 App Router project
✅ Tailwind v4 + shadcn/ui (base-nova)
✅ Marketing landing page
✅ Clerk integration (provider, sign-in, sign-up, middleware)
✅ Auth feature module (constants, hooks, session helpers)
✅ Protected dashboard shell
✅ Route constants (AUTH_ROUTES, PUBLIC_ROUTES)
```

### Not started (by feature)

```
✅ shop/          — Shop profile, onboarding, CRUD APIs
✅ inventory/     — Product + stock Server Actions (UI pending)
✅ pos/           — Cash sale API (UI pending)
✅ orders/        — Order lifecycle APIs (UI pending)
✅ storefront/    — Public catalog API (page UI pending)
✅ payments/      — Razorpay stub (gated on env)
✅ analytics/     — Dashboard summary API
✅ Database       — Neon + Drizzle schema (needs DATABASE_URL)
```

### Immediate next steps (when you resume coding)

1. Create Neon staging + production branches; add staging `DATABASE_URL` to `.env.local`
2. Run `pnpm db:push` against staging
3. Sign up → complete shop onboarding → verify dashboard summary cards
4. Smoke-test inventory/POS Server Actions and `GET /api/shop/[slug]/products`
5. Wire Vercel Preview → staging DB, Production → production DB

---

## Staging vs production (database)

| Env | Neon branch | Where to set `DATABASE_URL` |
|-----|-------------|------------------------------|
| Local | staging | `.env.local` |
| Vercel Preview | staging | Project → Settings → Environment Variables → Preview |
| Vercel Production | production | Project → Settings → Environment Variables → Production |

Always migrate/push **staging first**, verify onboarding + APIs, then apply the same schema to production.

## Appendix: Related Docs

- [VISION.md](./VISION.md) — Product vision and role boundaries
- [shadcnui.md](./shadcnui.md) — UI component notes

---

*DigiShop — The pocket-powered smart shop.*
