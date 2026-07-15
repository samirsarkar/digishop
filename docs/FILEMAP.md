# DigiShop — File Map

> **Purpose:** Single index for agents and humans. Consult this before searching the repo.  
> **Rule:** Update this file in the same change whenever you add, move, rename, or delete source files.  
> **Last updated:** 2026-07-15 (REST API routes + S3 image upload)

---

## How to use

1. Find the **feature / area** for the task below.
2. Open only the listed paths (plus their direct imports).
3. Do **not** glob or scan unrelated features.
4. After your change, update the matching section here.

---

## Quick decision table

| Task | Start here |
|------|------------|
| Auth / Clerk / routes / session | `src/features/auth/` + `src/proxy.ts` |
| Landing / marketing copy | `src/features/marketing/` |
| Shop onboarding / profile | `src/features/shop/` |
| Products / stock APIs + UI | `src/features/inventory/` + `/dashboard/inventory` + `src/app/api/products/` |
| Orders APIs | `src/features/orders/` + `src/app/api/orders/` |
| In-store cash sale | `src/features/pos/` + `src/app/api/pos/` |
| Public catalog API | `src/features/storefront/` + `src/app/api/shop/` |
| Merchant shop REST API | `src/app/api/shops/` |
| Image upload (S3 presigned) | `src/features/uploads/` + `src/app/api/upload/` |
| Payments stub | `src/features/payments/` + `src/app/api/payments/` |
| Dashboard summary metrics | `src/features/analytics/` + `src/app/api/analytics/` |
| REST route helpers | `src/shared/lib/api.ts` |
| DB schema / Drizzle client | `src/lib/db.ts` + `src/lib/db/schema.ts` |
| Shared errors / zod | `src/shared/lib/` |
| App shell / fonts / providers | `src/app/layout.tsx` |
| Protected merchant home | `src/app/dashboard/page.tsx` |
| Shared UI primitives | `src/components/ui/` |
| CSS / theme tokens | `src/app/globals.css` |
| Env templates | `.env.example` |
| Product vision | `docs/VISION.md` |
| Architecture & cost plan | `docs/PROJECT-PLAN.md` |
| This index | `docs/FILEMAP.md` |

---

## Root config

| Path | Role |
|------|------|
| `package.json` | Scripts & dependencies (`db:*` scripts) |
| `pnpm-lock.yaml` | Lockfile |
| `tsconfig.json` | TypeScript paths (`@/*` → `src/*`) |
| `next.config.ts` | Next.js config |
| `postcss.config.mjs` | PostCSS / Tailwind |
| `eslint.config.mjs` | ESLint |
| `components.json` | shadcn/ui config (base-nova) |
| `drizzle.config.ts` | Drizzle Kit (schema, migrations, Neon URL) |
| `.env.example` | Env var template (Clerk, DATABASE_URL, Razorpay) |
| `.gitignore` | Git ignores (includes `/.clerk/`) |
| `.cursorrules` | Project AI execution rules (includes File Map First) |
| `.cursor/rules/filemap.mdc` | Always-on rule: consult + update FILEMAP |
| `README.md` | Repo readme (includes Neon staging/prod setup) |

---

## Docs

| Path | Role |
|------|------|
| `docs/VISION.md` | Product vision, roles, pillars |
| `docs/PROJECT-PLAN.md` | Architecture, pricing, phases, estimates |
| `docs/FILEMAP.md` | **This file** — source of truth for file locations |
| `docs/shadcnui.md` | shadcn notes |

---

## App Router (`src/app/`) — routes only

| Path | Role | Imports from |
|------|------|--------------|
| `src/app/layout.tsx` | Root layout, fonts, `AuthProvider` | `features/auth`, `globals.css` |
| `src/app/page.tsx` | `/` — landing shell | `features/marketing` |
| `src/app/globals.css` | Tailwind + shadcn + Clerk theme CSS | — |
| `src/app/sign-in/[[...sign-in]]/page.tsx` | `/sign-in` | `features/auth` SignInView |
| `src/app/sign-up/[[...sign-up]]/page.tsx` | `/sign-up` | `features/auth` SignUpView |
| `src/app/dashboard/page.tsx` | `/dashboard` (protected) | `auth`, `shop`, `analytics` |
| `src/app/dashboard/onboarding/page.tsx` | `/dashboard/onboarding` | `features/shop` |
| `src/app/dashboard/inventory/page.tsx` | `/dashboard/inventory` products grid | `inventory`, `shop` |
| `src/app/dashboard/inventory/new/page.tsx` | Add product form | `inventory`, `shop` |
| `src/app/dashboard/inventory/barcodes/page.tsx` | Printable barcode labels | `inventory`, `shop` |
| `src/app/api/shop/[slug]/products/route.ts` | Public catalog JSON | `features/storefront` |

### REST API routes (protected via Clerk middleware; thin, delegate to feature services)

| Path | Methods | Delegates to |
|------|---------|--------------|
| `src/app/api/shops/route.ts` | GET current shop, POST create, PATCH update | `features/shop` |
| `src/app/api/shops/contacts/route.ts` | GET list, POST add | `features/shop` contacts |
| `src/app/api/shops/contacts/[contactId]/route.ts` | PATCH, DELETE | `features/shop` contacts |
| `src/app/api/products/route.ts` | GET paginated list, POST create | `features/inventory` |
| `src/app/api/products/categories/route.ts` | GET categories | `features/inventory` |
| `src/app/api/products/[productId]/route.ts` | GET, PATCH, DELETE | `features/inventory` |
| `src/app/api/products/[productId]/stock/route.ts` | PATCH adjust stock | `features/inventory` |
| `src/app/api/orders/route.ts` | GET list, POST create | `features/orders` |
| `src/app/api/orders/[orderId]/route.ts` | GET with items, PATCH status | `features/orders` |
| `src/app/api/pos/cash-sale/route.ts` | POST cash sale | `features/pos` |
| `src/app/api/payments/intent/route.ts` | POST payment intent (stub) | `features/payments` |
| `src/app/api/analytics/summary/route.ts` | GET shop summary | `features/analytics` |
| `src/app/api/upload/route.ts` | POST presigned S3 image upload URL | `features/uploads` |

### Planned routes (not created yet)

| Path | Role |
|------|------|
| `src/app/dashboard/pos/` | In-store POS UI |
| `src/app/dashboard/orders/` | Order management UI |
| `src/app/dashboard/analytics/` | Dedicated analytics / P&L UI (overview lives on dashboard) |
| `src/app/shop/[shopSlug]/` | Public customer storefront page |
| `src/app/shop/[shopSlug]/checkout/` | Customer checkout |

---

## Middleware / proxy

| Path | Role |
|------|------|
| `src/proxy.ts` | Clerk middleware; public routes; signed-in users redirected off `/sign-in` & `/sign-up` |

---

## Feature: `auth` ✅

```
src/features/auth/
├── constants.ts
├── types.ts
├── components/
│   ├── auth-provider.tsx
│   ├── auth-cta-link.tsx
│   ├── auth-header-controls.tsx
│   ├── sign-in-view.tsx
│   └── sign-up-view.tsx
├── hooks/
│   └── use-current-user.ts
└── services/
    └── session.ts
```

| Path | Role |
|------|------|
| `constants.ts` | `AUTH_ROUTES`, `PUBLIC_ROUTES` (includes `/shop`, `/api/shop`) |
| `types.ts` | `UserRole`, `AuthSession` |
| `components/auth-cta-link.tsx` | Landing CTAs: sign-up vs dashboard by session |
| `components/auth-provider.tsx` | `ClerkProvider` + shadcn theme |
| `components/auth-header-controls.tsx` | Header sign-in/up / UserButton |
| `components/sign-in-view.tsx` | Clerk `<SignIn />` wrapper |
| `components/sign-up-view.tsx` | Clerk `<SignUp />` wrapper |
| `hooks/use-current-user.ts` | Re-exports `useAuth`, `useClerk`, `useUser` |
| `services/session.ts` | Server: `getSession`, `getCurrentUser`, `requireUserId` |

---

## Feature: `marketing` ✅

| Path | Role |
|------|------|
| `src/features/marketing/components/landing-page.tsx` | Full landing page UI |

---

## Feature: `shop` ✅

```
src/features/shop/
├── constants.ts
├── types.ts
├── components/
│   ├── onboarding-form.tsx
│   └── merchant-shell.tsx
└── services/
    ├── shop.ts
    ├── contacts.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `constants.ts` | Dashboard/onboarding/inventory routes, `slugifyShopName` |
| `types.ts` | `ShopProfile`, `ShopRole`, `ShopContactProfile` |
| `services/shop.ts` | get/create/update shop, access checks |
| `services/contacts.ts` | list/add/update/delete shop contacts |
| `services/actions.ts` | Shop + contact Server Actions |
| `components/onboarding-form.tsx` | Client onboarding form (incl. phone/email) |
| `components/merchant-shell.tsx` | Shared merchant header + nav |

---

## Feature: `inventory` ✅ (APIs)

```
src/features/inventory/
├── types.ts
├── components/
│   ├── products-catalog.tsx
│   ├── product-form.tsx
│   ├── barcode-scanner-button.tsx
│   └── barcode-print-section.tsx
└── services/
    ├── products.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/products.ts` | CRUD, paginated list, categories, public list by slug |
| `services/actions.ts` | Server Actions for products + pagination |
| `components/products-catalog.tsx` | Grid + category filters + infinite scroll |
| `components/product-form.tsx` | Add product (SKU generate/copy, category) |
| `components/barcode-scanner-button.tsx` | Camera barcode scan (ZXing) |
| `components/barcode-print-section.tsx` | Select + print Code128 labels |
| `types.ts` | Re-exports `ProductWithStock` |

---

## Feature: `orders` ✅ (APIs)

```
src/features/orders/
├── types.ts
└── services/
    ├── orders.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/orders.ts` | list/get/create order, update status, stock decrement |
| `services/actions.ts` | Server Actions for orders |
| `types.ts` | Re-exports `OrderWithItems` |

---

## Feature: `pos` ✅ (APIs)

```
src/features/pos/
└── services/
    ├── cash-sale.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/cash-sale.ts` | `createCashSale` → completed cash order + stock |
| `services/actions.ts` | `createCashSaleAction` |

---

## Feature: `storefront` ✅ (APIs)

```
src/features/storefront/
└── services/
    └── catalog.ts
```

| Path | Role |
|------|------|
| `services/catalog.ts` | Public shop + in-stock products payload |

---

## Feature: `uploads` ✅ (S3 presigned image uploads)

```
src/features/uploads/
└── services/
    └── s3.ts
```

| Path | Role |
|------|------|
| `services/s3.ts` | `createImageUploadUrl` — presigned S3 PUT URL (AWS SDK v3); 503 `UPLOADS_NOT_CONFIGURED` until AWS env vars set |

---

## Feature: `payments` ✅ (stub)

```
src/features/payments/
└── services/
    ├── payments.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/payments.ts` | `createPaymentIntent` — gated until Razorpay env set |
| `services/actions.ts` | `createPaymentIntentAction` |

---

## Feature: `analytics` ✅ (APIs)

```
src/features/analytics/
├── components/
│   └── dashboard-overview.tsx
└── services/
    ├── summary.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/summary.ts` | `getShopSummary` (metrics, low stock, 7-day revenue, recent orders) |
| `services/actions.ts` | `getShopSummaryAction` |
| `components/dashboard-overview.tsx` | Merchant overview UI with charts + lists |

---

## Shared UI & utils

| Path | Role |
|------|------|
| `src/components/ui/button.tsx` | Button + `buttonVariants` (Base UI) |
| `src/components/ui/card.tsx` | Card primitives |
| `src/components/ui/badge.tsx` | Badge |
| `src/components/ui/separator.tsx` | Separator |
| `src/lib/utils.ts` | `cn()` helper |
| `src/lib/db.ts` | Neon HTTP + Drizzle client (`getDb`) |
| `src/lib/db/schema.ts` | Full core Postgres schema (incl. `shop_contacts`) |
| `src/shared/lib/money.ts` | `formatInr()` Indian Rupee helper |
| `src/shared/lib/errors.ts` | `AppError`, `ActionResult`, `toActionResult` |
| `src/shared/lib/api.ts` | Route-handler helpers: `handleApiError`, `requireDatabase`, `parseJsonBody`, `getQueryParams` |
| `src/shared/lib/logger.ts` | Structured `appLogger` (console now; Sentry/AI later) |
| `src/shared/lib/validators/shop.ts` | Shop + contact zod schemas |
| `src/shared/lib/validators/inventory.ts` | Product/stock zod schemas |
| `src/shared/lib/validators/orders.ts` | Order / cash-sale zod schemas |
| `src/shared/lib/validators/payments.ts` | Payment intent zod schema |
| `src/shared/lib/validators/uploads.ts` | Image upload zod schema (content types, 5 MB cap) |

---

## Agent / skills (do not edit for product features)

| Path | Role |
|------|------|
| `skills/` | Canonical agent skills |
| `agent/skills/` | Agent skill mirror |
| `.agents/skills/` | Cursor agent skills (if present) |

---

## Change log (file map)

| Date | Change |
|------|--------|
| 2026-07-12 | Initial FILEMAP created from current codebase |
| 2026-07-12 | Added `.cursor/rules/filemap.mdc`; linked from `.cursorrules` |
| 2026-07-12 | Fixed `docs/PROJECT-PLAN.md` layout: `components/ui`, `shared`, `lib` are siblings (not nested under `shared/`) |
| 2026-07-12 | Phase 0: Drizzle/Neon, shop onboarding, inventory/orders/pos/storefront/payments/analytics APIs |
| 2026-07-12 | Added `shop_contacts` table + contact CRUD APIs; onboarding phone/email |
| 2026-07-13 | Landing CTAs use session-aware AuthCtaLink (signed-in → dashboard) |
| 2026-07-13 | Middleware redirects signed-in users away from auth pages; Clerk forceRedirectUrl |
| 2026-07-13 | Inventory UI + real dashboard analytics (7-day revenue, low stock, recent orders) |
| 2026-07-13 | Fix Zod `.partial()` crash; always-visible auth CTAs; appLogger |
| 2026-07-13 | Products grid, categories, infinite scroll, barcode scan/print, INR helper |
| 2026-07-15 | REST API routes (shops, contacts, products, stock, orders, pos, payments, analytics) + S3 presigned image upload (`features/uploads`, `/api/upload`, AWS env vars) |
