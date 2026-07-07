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
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | [API Keys](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api-keys) → publishable (`sb_publishable_...`) |
| `SUPABASE_SECRET_KEY` | Same page → secret (`sb_secret_...`) — server only |
| `SUPABASE_JWKS_URL` | `https://dpnkkyzfehjqxlhdgpma.supabase.co/auth/v1/.well-known/jwks.json` |
| `DATABASE_URL` | Settings → Database → URI (Transaction/pooler, port **6543**) |
| `DIRECT_URL` | Settings → Database → URI (Session/direct, port **5432**) |

Legacy fallbacks still work: `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.

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
2. Paste contents of `supabase/migrations/20260706120000_init.sql` (fresh DB)
   - If you get **type already exists**, use `supabase/migrations/20260707070000_repair_schema.sql` instead
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

1. Go to [vercel.com/new](https://vercel.com/new) (or open existing **slj-erp-01** project)
2. Import `udhayak9876-a11y/SLJ_ERP01`
3. Open **Settings → Build and Deployment** and set:

| Setting | Value |
|---------|-------|
| Root Directory | `slj-erp` |
| Framework Preset | **Next.js** |
| Build Command | default — **Override OFF** |
| Output Directory | **empty** — **Override OFF** (never `public`) |
| Install Command | default — **Override OFF** |

4. Add environment variables (all 7 from Step 1a)
5. Deploy

> **Why "public" fails:** If Framework is **Other**, Vercel expects static files in a `public` output folder ([docs](https://vercel.com/docs/errors/error-list#missing-public-directory)). Next.js does not output there — `slj-erp/vercel.json` sets `"framework": "nextjs"` to force the correct builder.

After any env var change, **Redeploy** — `NEXT_PUBLIC_*` values are baked in at build time.

### Option A2 — Reset broken project settings (if error persists)

1. Vercel → **slj-erp-01** → **Settings → Build and Deployment**
2. Turn **OFF** every **Override** toggle (Build, Output, Install, Dev)
3. Set Framework to **Next.js**, Root Directory to `slj-erp`
4. Save → **Deployments** → **Redeploy**
5. If still failing, create a **new** Vercel project from the same GitHub repo with the settings above

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

### Option D — Alternative if dashboard settings keep failing

**D1. CLI deploy from app folder** (bypasses some dashboard overrides):

```bash
cd slj-erp
npx vercel@latest link    # select team uk6, project slj-erp-01
npx vercel@latest --prod
```

**D2. Prebuilt deploy** (uses Vercel's Next.js builder locally):

```bash
cd slj-erp
npx vercel@latest pull --environment=production
npx vercel@latest build --prod
npx vercel@latest deploy --prebuilt --prod
```

**D3. New Vercel project** — delete/relink is not required; instead create a fresh project at [vercel.com/new](https://vercel.com/new), import the same repo, set Root Directory `slj-erp`, Framework **Next.js**, add env vars, deploy.

**D4. Do not** set `outputDirectory: "public"` in `vercel.json` — that causes this exact error for Next.js SSR apps.

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
NEXT_PUBLIC_SUPABASE_URL=https://dpnkkyzfehjqxlhdgpma.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://dpnkkyzfehjqxlhdgpma.supabase.co/auth/v1/.well-known/jwks.json
DATABASE_URL=postgresql://...:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://...:5432/postgres
```

All must be set for **Production**, **Preview**, and **Development** in Vercel, then **redeploy**.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login fails | Check Supabase Site URL matches Vercel domain |
| Database errors | Run `npx prisma db push` or apply SQL migration |
| Build fails on Prisma | Ensure `DATABASE_URL` is set in Vercel env |
| 404 NOT_FOUND | Set Root Directory to `slj-erp` in Vercel → General → Redeploy |
| No Output Directory named "public" | Framework must be **Next.js** (not Other). Clear **Output Directory** override in Vercel → Build and Deployment. Ensure Root Directory is `slj-erp`. Redeploy after merging latest `main`. See [Vercel docs](https://vercel.com/docs/errors/error-list#missing-public-directory) |
| Redirects to Vercel SSO login | Disable **Deployment Protection** for Production in Vercel → Settings → Deployment Protection |
| "URL and Key are required" (Supabase) | Add `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in Vercel env vars, then **Redeploy** (not just Restart) |
| Application error after login | Add `DATABASE_URL` + `DIRECT_URL` in Vercel, run SQL migration in Supabase, redeploy. Check `/api/health` |
| Can't reach database server at :5432 | `DATABASE_URL` must be port **6543** (Transaction pooler), not 5432. Use Session URI only for `DIRECT_URL`. Redeploy. |
| invalid port number / invalid database string | URL-encode special characters in the database password. Use `&pgbouncer=true` if URI already has `?sslmode=require`. No spaces or `[YOUR-PASSWORD]` placeholder. Redeploy. |
