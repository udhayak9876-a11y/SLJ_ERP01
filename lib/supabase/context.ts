import { createServerClient } from "@supabase/ssr";
import {
  createAdminClient,
  createContextClient,
  verifyCredentials,
} from "@supabase/server/core";
import type {
  AuthModeWithKey,
  SupabaseContext,
  SupabaseEnv,
} from "@supabase/server";
import { cookies } from "next/headers";
import {
  getSupabaseJwksUrl,
  getSupabasePublishableKey,
  getSupabaseSecretKey,
  getSupabaseUrl,
} from "./env";

function resolveNextEnv(): Partial<SupabaseEnv> {
  const secretKey = getSupabaseSecretKey();
  return {
    url: getSupabaseUrl(),
    publishableKeys: { default: getSupabasePublishableKey() },
    secretKeys: secretKey ? { default: secretKey } : {},
  };
}

let cachedJwks: SupabaseEnv["jwks"] = null;

async function getJwks(): Promise<SupabaseEnv["jwks"]> {
  if (cachedJwks) return cachedJwks;
  try {
    const res = await fetch(getSupabaseJwksUrl());
    if (!res.ok) return null;
    cachedJwks = await res.json();
    return cachedJwks;
  } catch {
    return null;
  }
}

/**
 * Verified Supabase context for Server Components / Route Handlers.
 * Composes @supabase/ssr (cookies) with @supabase/server (JWT verification).
 */
export async function createSupabaseContext(
  options: { auth?: AuthModeWithKey | AuthModeWithKey[] } = { auth: "user" }
): Promise<
  { data: SupabaseContext; error: null } | { data: null; error: Error }
> {
  const nextEnv = resolveNextEnv();

  const cookieStore = await cookies();
  const ssrClient = createServerClient(
    nextEnv.url!,
    nextEnv.publishableKeys!.default,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Components can't write cookies — middleware handles it.
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await ssrClient.auth.getSession();
  const token = session?.access_token ?? null;

  const jwks = await getJwks();
  const env: Partial<SupabaseEnv> = { ...nextEnv, jwks };

  const { data: auth, error } = await verifyCredentials(
    { token, apikey: null },
    { auth: options.auth ?? "user", env }
  );

  if (error) {
    return { data: null, error };
  }

  const supabase = createContextClient({
    auth: { token: auth!.token },
    env,
  });
  const supabaseAdmin = createAdminClient({ env });

  return {
    data: {
      supabase,
      supabaseAdmin,
      userClaims: auth!.userClaims,
      jwtClaims: auth!.jwtClaims,
      authMode: auth!.authMode,
    },
    error: null,
  };
}
