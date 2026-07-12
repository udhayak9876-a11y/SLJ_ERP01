# Sri Lakshmi Jewellery ERP

Next.js 14 (App Router) billing ERP. The application lives in [`slj-erp/`](./slj-erp/).
Stack: Next.js 14 + TypeScript, Supabase (Auth), Prisma ORM over Supabase Postgres, Tailwind + shadcn/ui.

Standard commands (run inside `slj-erp/`, see `slj-erp/package.json`): `npm run dev`, `npm run build`, `npm run lint`, `npm run db:push`.

## Cursor Cloud specific instructions

The dev environment runs a **local Supabase stack in Docker** (no external Supabase project / secrets needed). Docker CE and the Supabase CLI are preinstalled in the VM snapshot; `npm install` is handled by the startup update script.

### Bring the environment up (services are NOT auto-started)

Run these from `/workspace/slj-erp` at the start of a session:

1. Start the Docker daemon (nothing is running on a fresh pod):
   - `sudo dockerd > /tmp/dockerd.log 2>&1 &` then `sudo chmod 666 /var/run/docker.sock`
   - The daemon is configured for docker-in-docker via `/etc/docker/daemon.json` (`storage-driver: fuse-overlayfs`, `containerd-snapshotter: false`). Do not remove that config or the daemon will fail to start containers.
2. Start Supabase: `supabase start` (from `slj-erp/`). It applies `supabase/migrations/*` automatically and prints the API URL + keys.
3. Start the app: `npm run dev` (serves http://localhost:3000).

### Non-obvious gotchas

- **DB port is 6543, on purpose.** `slj-erp/lib/db/validate.ts` rejects any `DATABASE_URL` that is not port `6543` with `pgbouncer=true`. So `supabase/config.toml` publishes the local Postgres on port **6543** (not the CLI default 54322). If you re-run `supabase init` or reset the port, restore `[db] port = 6543` or the app will report "database not configured".
- **`.env.local` is git-ignored** and must exist in `slj-erp/` for local dev. If missing, recreate it from the `supabase start` output:
  ```
  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY from `supabase start`>
  SUPABASE_SECRET_KEY=<SECRET_KEY from `supabase start`>
  SUPABASE_JWKS_URL=http://127.0.0.1:54321/auth/v1/.well-known/jwks.json
  DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:6543/postgres?pgbouncer=true&connection_limit=1
  DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:6543/postgres
  ```
  The local publishable/secret keys are stable defaults printed by `supabase start` (also via `supabase status`).
- **Auth requires a user.** Login (`/login`) only does password sign-in; there is no sign-up UI. Create a user against local GoTrue using the service_role key from `supabase start`:
  ```
  curl -X POST http://127.0.0.1:54321/auth/v1/admin/users \
    -H "apikey: <SERVICE_ROLE_KEY>" -H "Authorization: Bearer <SERVICE_ROLE_KEY>" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@slj.local","password":"admin1234","email_confirm":true}'
  ```
  Dev login used during setup: `admin@slj.local` / `admin1234`.
- **Schema:** `supabase start` applies the SQL migrations (26 tables + a seeded `ShopSettings` singleton). Alternatively `npm run db:push` syncs the schema from `prisma/schema.prisma`. Verify readiness at `GET /api/health` → expect `{"ok":true,...,"migrations":{"complete":true}}`.
- `next.config.mjs` only enforces Supabase env vars when `process.env.VERCEL` is set, so local `npm run build` works without Vercel env.
