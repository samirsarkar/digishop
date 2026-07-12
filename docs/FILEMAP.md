# DigiShop — File Map

> **Purpose:** Single index for agents and humans. Consult this before searching the repo.  
> **Rule:** Update this file in the same change whenever you add, move, rename, or delete source files.  
> **Last updated:** 2026-07-12 (shop_contacts)

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
| Products / stock APIs | `src/features/inventory/` |
| Orders APIs | `src/features/orders/` |
| In-store cash sale | `src/features/pos/` |
| Public catalog API | `src/features/storefront/` + `src/app/api/shop/` |
| Payments stub | `src/features/payments/` |
| Dashboard summary metrics | `src/features/analytics/` |
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
| `src/app/api/shop/[slug]/products/route.ts` | Public catalog JSON | `features/storefront` |

### Planned routes (not created yet)

| Path | Role |
|------|------|
| `src/app/dashboard/inventory/` | Inventory management UI |
| `src/app/dashboard/pos/` | In-store POS UI |
| `src/app/dashboard/orders/` | Order management UI |
| `src/app/dashboard/analytics/` | Analytics / P&L UI |
| `src/app/shop/[shopSlug]/` | Public customer storefront page |
| `src/app/shop/[shopSlug]/checkout/` | Customer checkout |

---

## Middleware / proxy

| Path | Role |
|------|------|
| `src/proxy.ts` | Clerk middleware; public vs protected routes via `PUBLIC_ROUTES` |

---

## Feature: `auth` ✅

```
src/features/auth/
├── constants.ts
├── types.ts
├── components/
│   ├── auth-provider.tsx
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
│   └── onboarding-form.tsx
└── services/
    ├── shop.ts
    ├── contacts.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `constants.ts` | Onboarding/dashboard routes, `slugifyShopName` |
| `types.ts` | `ShopProfile`, `ShopRole`, `ShopContactProfile` |
| `services/shop.ts` | get/create/update shop, access checks |
| `services/contacts.ts` | list/add/update/delete shop contacts |
| `services/actions.ts` | Shop + contact Server Actions |
| `components/onboarding-form.tsx` | Client onboarding form (incl. phone/email) |

---

## Feature: `inventory` ✅ (APIs)

```
src/features/inventory/
├── types.ts
└── services/
    ├── products.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/products.ts` | list/create/update/delete products, adjustStock, public list by slug |
| `services/actions.ts` | Server Actions for product CRUD + stock |
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
└── services/
    ├── summary.ts
    └── actions.ts
```

| Path | Role |
|------|------|
| `services/summary.ts` | `getShopSummary` (products, low stock, today revenue) |
| `services/actions.ts` | `getShopSummaryAction` |

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
| `src/shared/lib/errors.ts` | `AppError`, `ActionResult`, `toActionResult` |
| `src/shared/lib/validators/shop.ts` | Shop + contact zod schemas |
| `src/shared/lib/validators/inventory.ts` | Product/stock zod schemas |
| `src/shared/lib/validators/orders.ts` | Order / cash-sale zod schemas |
| `src/shared/lib/validators/payments.ts` | Payment intent zod schema |

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
