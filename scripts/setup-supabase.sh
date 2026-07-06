#!/usr/bin/env bash
set -euo pipefail

# Apply Prisma schema to Supabase PostgreSQL.
# Requires DATABASE_URL and DIRECT_URL in .env.local

cd "$(dirname "$0")/.."

if [ ! -f .env.local ]; then
  echo "ERROR: .env.local not found. Copy .env.example and fill Supabase credentials."
  exit 1
fi

export $(grep -v '^#' .env.local | xargs)

if [[ "${DATABASE_URL:-}" == *"your_supabase"* ]] || [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL is not configured in .env.local"
  exit 1
fi

echo "Generating Prisma client..."
npx prisma generate

echo "Pushing schema to Supabase..."
npx prisma db push

echo "Done. Tables created in Supabase."
echo "Next: create an admin user in Supabase Dashboard → Authentication → Users"
