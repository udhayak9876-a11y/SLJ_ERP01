# Sri Lakshmi Jewellery — ERP (Phase 1: Core Billing)

Web-based ERP for a gold jewellery retail shop in Tiruppur, Tamil Nadu.
Replaces a legacy Oracle + VB6 billing system.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Supabase** — PostgreSQL database + email/password auth
- **Prisma** ORM
- **Tailwind CSS** + shadcn/ui components
- **react-hook-form** + zod validation
- **react-to-print** for GST invoice printing
- Deployed on **Vercel**

## Phase 1 Modules

| Module | Route |
|---|---|
| Dashboard (stats, rates, recent bills) | `/` |
| Item Master (auto codes GOL-001, SIL-001…) | `/items` |
| Customer Master (auto codes CUS-0001…) | `/customers` |
| Daily Gold/Silver Rate entry | `/rates` |
| Sales Bill creation (draft/confirm) | `/bills/new` |
| Bills List (filter, cancel, confirm) | `/bills` |
| GST Tax Invoice print view (A4) | `/bills/[id]/print` |
| Shop Settings | `/settings` |

## Indian Conventions

- Currency: ₹ in lakh format — `₹1,25,000`
- Weights: grams, 3 decimal places — `10.450 g`
- Dates: `DD-MM-YYYY`
- Financial year: April–March; bill numbers `SLJ/24-25/0001`
- GST on gold: 3% — CGST 1.5% + SGST 1.5% intra-state (Tamil Nadu), IGST 3% inter-state
- Amount in words on invoice: "Rupees One Lakh Twenty Five Thousand Only"

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env.local` and fill in
   from the Supabase dashboard:

   | Variable | Where to find it |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role key |
   | `DATABASE_URL` | Settings → Database → Connection string (Transaction mode, port 6543) |
   | `DIRECT_URL` | Settings → Database → Connection string (Session mode, port 5432) |

3. **Push the schema to Supabase**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Create a staff user** — Supabase dashboard → Authentication → Users →
   "Add user" (email + password). There is no self-registration.

5. **Run locally**

   ```bash
   npm run dev
   ```

## Deploy to Vercel

`vercel.json` is already configured (`prisma generate && next build`).
Add the same five environment variables in the Vercel project settings, then:

```bash
vercel --prod
```

## Daily Workflow

1. Sign in → enter today's gold/silver rates (`/rates`) — billing needs them.
2. Create bills at `/bills/new`; rates auto-fill per item karat.
3. **Save as Draft** keeps the bill without a number; **Confirm & Print**
   assigns the next `SLJ/YY-YY/NNNN` number and opens the printable invoice.
