# digishop

A mobile-first shop management and customer-facing platform — the pocket-powered smart shop.

This project was bootstrapped with:

```bash
pnpm create next-app@latest digishop --yes
```

It uses the default `create-next-app` setup: Next.js App Router, TypeScript, Tailwind CSS v4, ESLint, and the `src/` directory.

See [docs/VISION.md](docs/VISION.md) for the full product vision.

## Getting Started

Install dependencies (if you haven't already):

```bash
pnpm install
```

Copy env template and fill in keys:

```bash
cp .env.example .env.local
```

### Database (Neon) — staging & production

1. Create a project at [https://console.neon.tech](https://console.neon.tech)
2. Create two branches (or databases):
   - **staging** — use this URL locally and on Vercel **Preview**
   - **production** (or `main`) — use this URL on Vercel **Production**
3. Copy the connection string into `.env.local` as `DATABASE_URL` (staging)
4. Push the schema:

```bash
pnpm db:push
```

| Environment | `DATABASE_URL` source |
|-------------|------------------------|
| Local (`.env.local`) | Neon **staging** |
| Vercel Preview | Neon **staging** |
| Vercel Production | Neon **production** |

Migrate staging first, then set production `DATABASE_URL` and run `pnpm db:migrate` (or `db:push`) against production.

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Run production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:push` | Push schema directly (good for staging) |
| `pnpm db:studio` | Open Drizzle Studio |

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (base-nova style, CSS variables)
- [Clerk](https://clerk.com) (auth)
- [Neon](https://neon.tech) + [Drizzle ORM](https://orm.drizzle.team) (Postgres)
- [TypeScript](https://www.typescriptlang.org)

Fonts are loaded via [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts):

- **DM Sans** — default UI font
- **Roboto** — numbers (`font-numeric` utility)
- **Geist Mono** — monospace

### UI & Styling

Styling uses **plain CSS** (`src/app/globals.css`), not SCSS. This is the recommended path for Tailwind v4 + shadcn/ui — design tokens live in `@theme`, shadcn variables in `:root`, and base styles in `@layer base`.

Add shadcn components with:

```bash
pnpm dlx shadcn@latest add <component>
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

## Deploy on Vercel

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
