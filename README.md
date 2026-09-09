# Hyper POS — Quotation module (rebuild)

A standalone rebuild of the Quotation page from a reference POS system
(`hyper-pos.eshopweb.store`), built with Next.js (App Router), TypeScript, Tailwind CSS,
Prisma, and PostgreSQL.

See **[QUOTATION_AUDIT.md](./QUOTATION_AUDIT.md)** for the full reverse-engineering audit:
how this was researched (and its constraints), page structure, business logic, database
model, API, and test results.

## Quick start

```bash
# 1. Point DATABASE_URL at a running PostgreSQL instance
cp .env.example .env

# 2. Install dependencies
npm install --legacy-peer-deps

# 3. Create the schema and seed demo data
npx prisma migrate dev
npx prisma db seed

# 4. Run the app
npm run dev
```

Then open <http://localhost:3000/admin/quotations>.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4 + hand-built shadcn/ui-style components (Radix UI primitives)
- Prisma 7 + PostgreSQL (via `@prisma/adapter-pg`)
- Zod + React Hook Form–style controlled forms
- `sonner` for toasts

## Project layout

```
prisma/                     schema, migrations, seed data
src/app/admin/              app shell + quotations pages (list, new, [id])
src/app/api/                REST API routes (quotations, customers, products, stores)
src/components/quotation/   Quotation-specific UI (form, table, summary, selectors, ...)
src/components/layout/      Sidebar, header, mobile nav
src/components/ui/          Generic UI primitives (button, input, dialog, table, ...)
src/lib/                    Prisma client, calculations, validation schemas, business rules
```
