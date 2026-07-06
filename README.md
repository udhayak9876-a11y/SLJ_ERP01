# Sri Lakshmi Jewellery ERP

Web-based billing ERP for **Sri Lakshmi Jewellery**, Tiruppur, Tamil Nadu.

The Next.js application is in [`slj-erp/`](./slj-erp/).

## Vercel deployment (required)

In Vercel → **slj-erp-01** → **Settings → Build and Deployment**:

| Setting | Value |
|---------|-------|
| **Root Directory** | `slj-erp` |
| **Framework Preset** | **Next.js** |
| **Build Command** | leave default (or turn **Override** off) |
| **Output Directory** | leave **empty** — turn **Override** off if it says `public` |
| **Install Command** | leave default |

If **Output Directory** is set to `public`, Vercel treats the app as a static site and fails with:

> No Output Directory named "public" found after the Build completed

See [Vercel: Missing public directory](https://vercel.com/docs/errors/error-list#missing-public-directory).

After changing settings → **Deployments** → **Redeploy**.

See [slj-erp/DEPLOY.md](./slj-erp/DEPLOY.md) and [slj-erp/SETUP-CHECKLIST.md](./slj-erp/SETUP-CHECKLIST.md) for full setup.
