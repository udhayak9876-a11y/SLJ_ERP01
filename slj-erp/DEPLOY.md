# Deploy Sri Lakshmi Jewellery ERP

## Prerequisites

- Supabase project (PostgreSQL + Auth)
- Vercel account
- GitHub repo connected to Vercel (recommended)

---

## Your Supabase project

| | |
|---|---|
| **Project URL** | `https://dpnkkyzfehjqxlhdgpma.supabase.co` |
| **Project ref** | `dpnkkyzfehjqxlhdgpma` |
| **API settings** | [Dashboard → API](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api) |
| **Database settings** | [Dashboard → Database](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database) |
| **SQL Editor** | [Run migration](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new) |
| **Create users** | [Authentication → Users](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/auth/users) |

---

## Step 1 — Connect Supabase

### 1a. Get credentials

In [Supabase Dashboard → API](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api):

| Variable | Location |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dpnkkyzfehjqxlhdgpma.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → service_role |
| `DATABASE_URL` | Settings → Database → URI (Transaction/pooler, port **6543**) |
| `DIRECT_URL` | Settings → Database → URI (Session/direct, port **5432**) |

For `DATABASE_URL`, append `?pgbouncer=true` if using the pooler.

### 1b. Create database tables

**Option A — Prisma (recommended)**

```bash
cp .env.example .env.local
# Edit .env.local with your values
./scripts/setup-supabase.sh
```

**Option B — SQL Editor**

1. Supabase → SQL Editor → New query
2. Paste contents of `supabase/migrations/20260706120000_init.sql`
3. Run

### 1c. Create admin user

Supabase → **Authentication → Users → Add user**

- Email + password (staff will use this to sign in)
- No public sign-up in the app

### 1d. Configure Auth redirect (production)

Supabase → Authentication → URL Configuration:

- **Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: add `https://your-app.vercel.app/**`

---

## Step 2 — Deploy to Vercel

### Option A — Vercel Dashboard (easiest)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import `udhayak9876-a11y/SLJ_ERP01`
3. **Root Directory** → `slj-erp` (required)
4. **Framework Preset** → **Next.js** (not "Other")
5. **Output Directory** → leave **empty** (do not set `public` — Next.js uses `.next` internally)
6. Add environment variables (all 5 from Step 1a)
7. Deploy

### Option B — Vercel CLI

```bash
npx vercel login
npx vercel link        # create/link project
npx vercel env add     # add each env var for Production
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

### Option C — GitHub Actions (CI/CD)

Add these secrets in GitHub → repo → Settings → Secrets:

| Secret | How to get |
|--------|------------|
| `VERCEL_TOKEN` | Vercel → Settings → Tokens |
| `VERCEL_ORG_ID` | `vercel link` → `.vercel/project.json` |
| `VERCEL_PROJECT_ID` | `vercel link` → `.vercel/project.json` |

Also add all 5 Supabase env vars in **Vercel project settings** (not GitHub secrets — the app reads them at runtime).

Push to `main` to trigger deploy.

---

## Step 3 — Verify

1. Open your Vercel URL → `/login`
2. Sign in with the Supabase admin user
3. Go to `/rates` → enter today's gold rates
4. Add an item and customer
5. Create a test bill at `/bills/new`

---

## Environment variables checklist (Vercel)

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
DATABASE_URL
DIRECT_URL
```

All must be set for **Production**, **Preview**, and **Development** in Vercel.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login fails | Check Supabase Site URL matches Vercel domain |
| Database errors | Run `npx prisma db push` or apply SQL migration |
| Build fails on Prisma | Ensure `DATABASE_URL` is set in Vercel env |
| 404 NOT_FOUND | Set Root Directory to `slj-erp` in Vercel → General → Redeploy |
| No Output Directory named "public" | Vercel → Project Settings → General → clear **Output Directory** (leave blank) and set **Framework Preset** to **Next.js**, then redeploy |
| Redirects to Vercel SSO login | Disable **Deployment Protection** for Production in Vercel → Settings → Deployment Protection |
