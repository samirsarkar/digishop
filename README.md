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

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Edit `src/app/page.tsx` — the page updates as you save.

## Scripts

| Command       | Description              |
|---------------|--------------------------|
| `pnpm dev`    | Start development server |
| `pnpm build`  | Production build         |
| `pnpm start`  | Run production server    |
| `pnpm lint`   | Run ESLint               |

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [React 19](https://react.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (base-nova style, CSS variables)
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
