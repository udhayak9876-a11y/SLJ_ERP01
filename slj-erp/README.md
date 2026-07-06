# Sri Lakshmi Jewellery ERP

Web-based billing ERP for **Sri Lakshmi Jewellery**, Tiruppur, Tamil Nadu.

## Vercel — Root Directory (required)

In Vercel project settings → **General → Root Directory**, set:

```
slj-erp
```

Without this you get `404: NOT_FOUND`. See [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md).

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- Tailwind CSS + shadcn/ui
- Vercel deployment

## Getting Started

```bash
cd slj-erp
npm install
cp .env.example .env.local
# fill in Supabase credentials
npm run dev
```

## Environment variables (Vercel)

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dpnkkyzfehjqxlhdgpma.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | from Supabase API Keys |
| `SUPABASE_SECRET_KEY` | from Supabase API Keys |
| `SUPABASE_JWKS_URL` | `https://dpnkkyzfehjqxlhdgpma.supabase.co/auth/v1/.well-known/jwks.json` |
| `DATABASE_URL` | Transaction mode (port 6543) |
| `DIRECT_URL` | Session mode (port 5432) |

## Database setup

```bash
./scripts/setup-supabase.sh
```

Or run `supabase/migrations/20260706120000_init.sql` in Supabase SQL Editor.
