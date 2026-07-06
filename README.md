# Sri Lakshmi Jewellery ERP

Web-based billing ERP for **Sri Lakshmi Jewellery**, Tiruppur, Tamil Nadu.

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth)
- Prisma ORM
- Tailwind CSS + shadcn/ui
- Vercel deployment

## Phase 1 Modules

- Authentication (email/password via Supabase)
- Shop settings
- Item master
- Customer master (+ quick-add from billing)
- Daily gold/silver rate entry
- Sales bill creation with auto-calculations
- GST tax invoice print view
- Dashboard & bills list

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in values from Supabase:

| Variable | Source |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dpnkkyzfehjqxlhdgpma.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | [API Keys](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api-keys) → publishable |
| `SUPABASE_SECRET_KEY` | [API Keys](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api-keys) → secret |
| `SUPABASE_JWKS_URL` | `https://dpnkkyzfehjqxlhdgpma.supabase.co/auth/v1/.well-known/jwks.json` |
| `DATABASE_URL` | [Database settings](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database) → Transaction (port 6543) |
| `DIRECT_URL` | [Database settings](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database) → Session (port 5432) |

### 3. Database setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Create admin user

Create users manually in Supabase Dashboard → Authentication → Users (no self-registration).

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Vercel Deployment

Import the GitHub repo in Vercel. **Root Directory must be empty** (app is at repo root).

Add the same environment variables in the Vercel dashboard, then deploy:

```bash
vercel --prod
```

`vercel.json` is included with:

```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install"
}
```

## Indian Business Conventions

- Currency: ₹ lakh format (₹1,25,000)
- Weight: grams, 3 decimal places
- Dates: DD-MM-YYYY
- GST: 3% on jewellery (CGST+SGST intra-state, IGST inter-state)
- Bill numbers: `SLJ/YY-YY/NNNN` (financial year April–March)

## Project Structure

```
├── app/(auth)/login/       # Login page
├── app/(dashboard)/        # All ERP screens
├── components/             # UI, bills, items, customers
├── lib/                    # Supabase, Prisma, utils, server actions
├── prisma/schema.prisma    # Database schema
└── middleware.ts           # Auth protection
```
