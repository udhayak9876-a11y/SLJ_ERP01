# Setup checklist — Sri Lakshmi Jewellery ERP

**Live Vercel URL:** https://slj-erp-01-uk6.vercel.app  
**Supabase project:** https://dpnkkyzfehjqxlhdgpma.supabase.co

---

## Status

| Step | Status | Action |
|------|--------|--------|
| Vercel deployed | Done | — |
| Supabase URL + publishable key | Done | Verify in Vercel env vars |
| Database tables | **Not done** | Run SQL migration (Step 1 below) |
| DATABASE_URL in Vercel | **Likely missing** | Add from Supabase (Step 2) |
| Admin user in Supabase | **Check** | Create user (Step 3) |
| Auth redirect URLs | **Check** | Set Vercel domain (Step 4) |
| Vercel Deployment Protection | **Blocking public access** | Disable (Step 5) |

---

## Step 1 — Create database tables (required)

Tables are **not** in Supabase yet (`ShopSettings` table missing).

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new)
2. Copy **all** of `supabase/migrations/20260706120000_init.sql`
3. Click **Run**

You should see: Success. No rows returned.

---

## Step 2 — Vercel environment variables

Vercel → **slj-erp-01** → Settings → Environment Variables

Set these for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://dpnkkyzfehjqxlhdgpma.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_7VBZjB_il1gU_x9cufn8Hg_v9Nyej8c
SUPABASE_SECRET_KEY=<full sb_secret_ key from API Keys settings>
SUPABASE_JWKS_URL=https://dpnkkyzfehjqxlhdgpma.supabase.co/auth/v1/.well-known/jwks.json
DATABASE_URL=<Transaction mode, port 6543>
DIRECT_URL=<Session mode, port 5432>
```

Get keys: [API Keys settings](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api-keys)  
Get database strings: [Database Settings](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database)

After adding/changing vars → **Redeploy** (Deployments → ⋯ → Redeploy).

---

## Step 3 — Create admin user

[Supabase → Authentication → Users → Add user](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/auth/users)

Example: `admin@slj.local` + a password your staff will use.

---

## Step 4 — Supabase Auth URLs

[Authentication → URL Configuration](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/auth/url-configuration)

| Field | Value |
|-------|-------|
| Site URL | `https://slj-erp-01-uk6.vercel.app` |
| Redirect URLs | `https://slj-erp-01-uk6.vercel.app/**` |

---

## Step 5 — Disable Vercel Deployment Protection

Your app currently redirects to Vercel login (not your ERP login).

1. Vercel → **slj-erp-01** → Settings → **Deployment Protection**
2. Turn off protection for Production (or add your team/users as allowed)
3. Save and redeploy if needed

---

## Step 6 — Test

1. Open https://slj-erp-01-uk6.vercel.app/login
2. You should see **Sri Lakshmi Jewellery** login (not Vercel login)
3. Sign in with the Supabase admin user
4. Go to `/rates` → enter today's gold rates
5. Create a test bill at `/bills/new`

---

## Vercel root directory (important)

The app now lives at the **repository root** (not in a subfolder).

1. Vercel → **slj-erp-01** → Settings → **General** → Root Directory
2. Set to **empty** (`.` or leave blank) — **NOT** `slj-erp`
3. Save and **Redeploy**
