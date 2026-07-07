function parseDatabaseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getPort(url: string): number | null {
  const parsed = parseDatabaseUrl(url);
  if (!parsed) return null;
  if (parsed.port) return Number(parsed.port);
  return parsed.protocol === "postgresql:" || parsed.protocol === "postgres:"
    ? 5432
    : null;
}

export function validateDatabaseUrls(): string | null {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";

  if (!databaseUrl || databaseUrl.includes("[YOUR_DB_PASSWORD]")) {
    return "DATABASE_URL is not set in Vercel environment variables.";
  }

  if (!directUrl || directUrl.includes("[YOUR_DB_PASSWORD]")) {
    return "DIRECT_URL is not set in Vercel environment variables.";
  }

  const databasePort = getPort(databaseUrl);
  if (databasePort === 5432) {
    return [
      "DATABASE_URL is using port 5432 (direct/session).",
      "On Vercel it must use port 6543 (Supabase Transaction pooler).",
      "In Supabase → Database Settings → Connection string → Mode: Transaction → copy URI,",
      "then append ?pgbouncer=true&connection_limit=1 and set that as DATABASE_URL.",
      "Keep the Session/direct URI (port 5432) as DIRECT_URL only.",
    ].join(" ");
  }

  if (databaseUrl.includes("db.") && databaseUrl.includes(".supabase.co")) {
    return [
      "DATABASE_URL uses the direct host db.*.supabase.co.",
      "Use the pooler host (*.pooler.supabase.com) on port 6543 for DATABASE_URL instead.",
    ].join(" ");
  }

  if (!databaseUrl.includes("pgbouncer=true") && databasePort === 6543) {
    return [
      "DATABASE_URL should include ?pgbouncer=true&connection_limit=1 when using port 6543.",
    ].join(" ");
  }

  return null;
}

export function isDatabaseConfigured(): boolean {
  return validateDatabaseUrls() === null;
}

export function getDatabaseConfigError(): string | null {
  return validateDatabaseUrls();
}

export function getDatabaseConnectionHint(queryError?: string | null): string | null {
  if (!queryError) return null;

  if (queryError.includes(":5432") || queryError.includes("port 5432")) {
    return "Connection failed on port 5432. Set DATABASE_URL to the Transaction pooler URI (port 6543), not the Session/direct URI.";
  }

  if (queryError.includes("Can't reach database server")) {
    return "Vercel cannot reach the database. Use the pooler hostname (*.pooler.supabase.com), correct password, and redeploy after saving env vars.";
  }

  return null;
}
