/** @type {import('next').NextConfig} */

function assertSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  if (!url || !key) {
    throw new Error(
      [
        "Missing Supabase environment variables for build.",
        "Set these in Vercel → Project → Settings → Environment Variables (Production + Preview):",
        "  NEXT_PUBLIC_SUPABASE_URL",
        "  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY  (or NEXT_PUBLIC_SUPABASE_ANON_KEY)",
        "Then redeploy so NEXT_PUBLIC_* values are embedded at build time.",
      ].join("\n")
    );
  }
}

if (process.env.VERCEL) {
  assertSupabaseEnv();
}

const nextConfig = {};

export default nextConfig;
