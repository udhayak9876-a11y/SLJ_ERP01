# Setup checklist — Sri Lakshmi Jewellery ERP

**Live Vercel URL:** https://slj-erp-01-uk6.vercel.app  
**Supabase project:** https://dpnkkyzfehjqxlhdgpma.supabase.co

---

## Status

| Step | Status | Action |
|------|--------|--------|
| Vercel deployed | Done | — |
| Supabase URL + anon key | Done | Verify in Vercel env vars |
| Database tables | **Not done** | Run SQL migration (Step 1 below) |
| DATABASE_URL in Vercel | **Likely missing** | Add from Supabase (Step 2) |
| Admin user in Supabase | **Check** | Create user (Step 3) |
| Auth redirect URLs | **Check** | Set Vercel domain (Step 4) |
| Vercel Deployment Protection | **Blocking public access** | Disable (Step 5) |

---

## Step 1 — Create database tables (required)

Tables are **not** in Supabase yet (`ShopSettings` table missing).

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new)
2. Copy **all** of `slj-erp/supabase/migrations/20260706120000_init.sql`
3. Click **Run**

You should see: Success. No rows returned.

---

## Step 2 — Vercel environment variables

Vercel → **slj-erp-01** → Settings → Environment Variables

Set these for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=https://dpnkkyzfehjqxlhdgpma.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase API settings>
DATABASE_URL=<Transaction mode, port 6543 — from Database settings>
DIRECT_URL=<Session mode, port 5432 — from Database settings>
```

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

## Root directory check

If pages show 404, confirm Vercel **Root Directory** = `slj-erp`  
(Settings → General → Root Directory)
