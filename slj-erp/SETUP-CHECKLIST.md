# Setup checklist — Sri Lakshmi Jewellery ERP

**Live Vercel URL:** https://slj-erp-01-uk6.vercel.app  
**Supabase project:** https://dpnkkyzfehjqxlhdgpma.supabase.co

---

## Status

| Step | Status | Action |
|------|--------|--------|
| Vercel deployed | Done | — |
| Supabase URL + publishable key | Done | Verify in Vercel env vars |
| Database tables | **Required** | Run SQL migration (Step 1 below) |
| DATABASE_URL in Vercel | **Required** | Add from Supabase (Step 2) |
| Admin user in Supabase | **Check** | Create user (Step 3) |
| Auth redirect URLs | **Check** | Set Vercel domain (Step 4) |
| Vercel Deployment Protection | **Blocking public access** | Disable (Step 5) |

---

## Step 1 — Create database tables (required)

If this is a **fresh** database, run `supabase/migrations/20260706120000_init.sql`.

If you already tried and got **`type "Category" already exists`**, run this file instead (safe to re-run):

**`supabase/migrations/20260707070000_repair_schema.sql`**

1. Open [Supabase SQL Editor](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new)
2. Copy **all** of the chosen migration file from this folder
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
DATABASE_URL=<Transaction pooler, port 6543 — see below>
DIRECT_URL=<Session pooler, port 5432 — see below>
```

### Getting the database URLs (important)

1. Open [Supabase Database Settings](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database)
2. Click **Connect** (or **Connection string**)
3. Choose **URI** format

| Vercel variable | Supabase setting | Port | Example host |
|---------------|------------------|------|--------------|
| `DATABASE_URL` | **Transaction** pooler | **6543** | `aws-0-....pooler.supabase.com` |
| `DIRECT_URL` | **Session** pooler | **5432** | `aws-0-....pooler.supabase.com` |

4. For `DATABASE_URL`, append pooler params:
   - If the URI has **no** `?` yet: `?pgbouncer=true&connection_limit=1`
   - If it already has `?sslmode=require`: `&pgbouncer=true&connection_limit=1`
5. Replace `[YOUR-PASSWORD]` with your database password

### If password has special characters (@ # % : / ?)

URL-encode **only the password** before pasting into Vercel.

| Password | Encoded |
|----------|---------|
| `P@ss#1` | `P%40ss%231` |
| `my@pass` | `my%40pass` |

In browser console: `encodeURIComponent("your-password")`

**Invalid port number** error in Vercel almost always means the password broke the URL or query params were added with an extra `?`.

**Common mistake:** putting the port **5432** URI in `DATABASE_URL`. That causes:
`Can't reach database server at ...:5432` on Vercel.

- `DATABASE_URL` = port **6543** (Transaction) — app runtime on Vercel
- `DIRECT_URL` = port **5432** (Session) — Prisma migrations only

Get keys: [API Keys settings](https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/api-keys)

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
4. If you see **Database setup required**, complete Steps 1–2 above and redeploy
5. Check https://slj-erp-01-uk6.vercel.app/api/health — should return `"ok": true`
6. Go to `/rates` → enter today's gold rates
7. Create a test bill at `/bills/new`

---

## Vercel root directory (required)

The app lives in the `slj-erp/` subfolder.

1. Vercel → **slj-erp-01** → Settings → **General** → Root Directory
2. Set to **`slj-erp`** (exactly this value)
3. Save and **Redeploy**

If Root Directory is empty or wrong, you will get `404: NOT_FOUND`.
