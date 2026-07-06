#!/usr/bin/env bash
set -euo pipefail

# Deploy slj-erp to Vercel production.
# Requires: vercel login (or VERCEL_TOKEN env var)

cd "$(dirname "$0")/.."

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "Checking Vercel CLI auth..."
  npx vercel@latest whoami || {
    echo "Run: npx vercel login"
    exit 1
  }
fi

echo "Deploying to Vercel production..."
npx vercel@latest --prod

echo "Done. Set environment variables in Vercel dashboard if not already configured."
