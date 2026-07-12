# DigiShop — File Map

> **Purpose:** Single index for agents and humans. Consult this before searching the repo.  
> **Rule:** Update this file in the same change whenever you add, move, rename, or delete source files.  
> **Last updated:** 2026-07-12 (aligned PROJECT-PLAN layout)

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
| `package.json` | Scripts & dependencies |
| `pnpm-lock.yaml` | Lockfile |
| `tsconfig.json` | TypeScript paths (`@/*` → `src/*`) |
| `next.config.ts` | Next.js config |
| `postcss.config.mjs` | PostCSS / Tailwind |
| `eslint.config.mjs` | ESLint |
| `components.json` | shadcn/ui config (base-nova) |
| `.env.example` | Env var template (Clerk keys + auth URLs) |
| `.gitignore` | Git ignores (includes `/.clerk/`) |
| `.cursorrules` | Project AI execution rules (includes File Map First) |
| `.cursor/rules/filemap.mdc` | Always-on rule: consult + update FILEMAP |
| `README.md` | Repo readme |

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
| `src/app/dashboard/page.tsx` | `/dashboard` (protected) | `features/auth` session |

### Planned routes (not created yet)

| Path | Role |
|------|------|
| `src/app/dashboard/inventory/` | Inventory management |
| `src/app/dashboard/pos/` | In-store POS |
| `src/app/dashboard/orders/` | Order management |
| `src/app/dashboard/analytics/` | Analytics / P&L |
| `src/app/shop/[shopSlug]/` | Public customer storefront |
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
| `constants.ts` | `AUTH_ROUTES`, `PUBLIC_ROUTES` |
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

## Features planned (empty — create when building)

| Feature | Intended path | Purpose |
|---------|---------------|---------|
| `shop` | `src/features/shop/` | Shop profile, slug, settings, onboarding |
| `inventory` | `src/features/inventory/` | Products, stock, barcode scan |
| `pos` | `src/features/pos/` | In-store cart & checkout |
| `orders` | `src/features/orders/` | Order lifecycle |
| `storefront` | `src/features/storefront/` | Customer browsing UI |
| `payments` | `src/features/payments/` | Razorpay |
| `analytics` | `src/features/analytics/` | Charts, P&L |

**Convention per feature:**

```
src/features/<name>/
├── components/
├── hooks/
├── services/
├── constants.ts      # optional
├── types.ts          # optional
└── __tests__/        # optional
```

---

## Shared UI & utils

| Path | Role |
|------|------|
| `src/components/ui/button.tsx` | Button + `buttonVariants` (Base UI) |
| `src/components/ui/card.tsx` | Card primitives |
| `src/components/ui/badge.tsx` | Badge |
| `src/components/ui/separator.tsx` | Separator |
| `src/lib/utils.ts` | `cn()` helper |

> Note: `.cursorrules` mentions `src/shared/`; prefer that for new shared hooks/utils. Existing UI lives under `src/components/ui/` (shadcn default). Do not duplicate without updating this map.

### Planned shared (not created)

| Path | Role |
|------|------|
| `src/shared/hooks/` | Cross-feature hooks |
| `src/shared/lib/` | db client, validators |
| `src/lib/db.ts` | Drizzle / Neon client (when added) |

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
