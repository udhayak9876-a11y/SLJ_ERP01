const PLACEHOLDER_PATTERN = /\[YOUR[-_]?PASSWORD\]/i;

function trimCheck(url: string, label: string): string | null {
  if (!url.trim()) return `${label} is empty.`;
  if (url !== url.trim()) {
    return `${label} has leading or trailing spaces. Remove spaces and redeploy.`;
  }
  if (url.includes("\n") || url.includes("\r")) {
    return `${label} contains a line break. Paste the URL as a single line in Vercel.`;
  }
  return null;
}

function placeholderCheck(url: string, label: string): string | null {
  if (PLACEHOLDER_PATTERN.test(url) || url.includes("[YOUR_DB_PASSWORD]")) {
    return `${label} still contains the [YOUR-PASSWORD] placeholder. Replace it with your real database password.`;
  }
  return null;
}

function parsePostgresUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

function getPort(url: string): number | null {
  const parsed = parsePostgresUrl(url);
  if (!parsed) return null;
  if (!parsed.port) {
    return parsed.protocol === "postgresql:" || parsed.protocol === "postgres:"
      ? 5432
      : null;
  }
  const port = Number(parsed.port);
  return Number.isInteger(port) ? port : null;
}

function validatePostgresUrl(url: string, label: string): string | null {
  const trimError = trimCheck(url, label);
  if (trimError) return trimError;

  const placeholderError = placeholderCheck(url, label);
  if (placeholderError) return placeholderError;

  if (url.includes("??")) {
    return `${label} has a double "?" in the query string. Use "&" to add extra parameters.`;
  }

  const parsed = parsePostgresUrl(url);
  if (!parsed) {
    return [
      `${label} is not a valid PostgreSQL URL.`,
      "Most common cause: the database password contains special characters (@ # % : / ? &).",
      "Fix: URL-encode only the password, then paste the full URI into Vercel.",
      'Example: password "P@ss#1" becomes "P%40ss%231" in the connection string.',
    ].join(" ");
  }

  if (parsed.protocol !== "postgresql:" && parsed.protocol !== "postgres:") {
    return `${label} must use the postgresql:// scheme.`;
  }

  if (!parsed.hostname) {
    return `${label} is missing a hostname.`;
  }

  const port = getPort(url);
  if (port === null || port < 1 || port > 65535) {
    return [
      `${label} has an invalid port.`,
      "This usually means the password broke the URL or query params were appended incorrectly.",
      "Encode special characters in the password and ensure port is 6543 (DATABASE_URL) or 5432 (DIRECT_URL).",
    ].join(" ");
  }

  if (!parsed.pathname || parsed.pathname === "/") {
    return `${label} should end with /postgres`;
  }

  return null;
}

function appendPoolerParams(databaseUrl: string): string | null {
  if (!databaseUrl.includes("pgbouncer=true")) {
    const separator = databaseUrl.includes("?") ? "&" : "?";
    return `${databaseUrl}${separator}pgbouncer=true&connection_limit=1`;
  }
  return null;
}

export function validateDatabaseUrls(): string | null {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const directUrl = process.env.DIRECT_URL ?? "";

  const databaseFormatError = validatePostgresUrl(databaseUrl, "DATABASE_URL");
  if (databaseFormatError) return databaseFormatError;

  const directFormatError = validatePostgresUrl(directUrl, "DIRECT_URL");
  if (directFormatError) return directFormatError;

  const databasePort = getPort(databaseUrl);
  if (databasePort === 5432) {
    return [
      "DATABASE_URL is using port 5432 (Session/direct).",
      "On Vercel it must use port 6543 (Transaction pooler).",
      "Copy the Transaction URI from Supabase and set it as DATABASE_URL.",
      "Keep the Session URI (5432) as DIRECT_URL only.",
    ].join(" ");
  }

  if (databaseUrl.includes("db.") && databaseUrl.includes(".supabase.co")) {
    return [
      "DATABASE_URL uses the direct host db.*.supabase.co.",
      "Use the pooler host (*.pooler.supabase.com) on port 6543 for DATABASE_URL instead.",
    ].join(" ");
  }

  if (databasePort === 6543 && !databaseUrl.includes("pgbouncer=true")) {
    const suggested = appendPoolerParams(databaseUrl);
    return [
      "DATABASE_URL is missing ?pgbouncer=true&connection_limit=1.",
      suggested
        ? `Use this value: ${suggested}`
        : "Append ?pgbouncer=true&connection_limit=1 (or & if the URI already has ?params).",
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

export function getDatabaseConnectionHint(
  queryError?: string | null
): string | null {
  if (!queryError) return null;

  if (
    queryError.includes("invalid port number") ||
    queryError.includes("invalid database string") ||
    queryError.includes("Error parsing connection string")
  ) {
    return [
      "The database URL in Vercel is malformed.",
      "1) Open Supabase → Database → Connection string → URI.",
      "2) Copy Transaction (6543) for DATABASE_URL.",
      "3) Replace [YOUR-PASSWORD] with your real password — if it contains @ # % : / ? encode it first.",
      "4) If the URI already has ?sslmode=require, add &pgbouncer=true&connection_limit=1 (not another ?).",
      "5) Save in Vercel and Redeploy.",
    ].join(" ");
  }

  if (queryError.includes(":5432") || queryError.includes("port 5432")) {
    return "Connection failed on port 5432. Set DATABASE_URL to the Transaction pooler URI (port 6543), not the Session URI.";
  }

  if (queryError.includes("Can't reach database server")) {
    return "Vercel cannot reach the database. Check the pooler hostname, password, and redeploy after saving env vars.";
  }

  return null;
}

export function buildDatabaseUrlExample(): string {
  return "postgresql://postgres.dpnkkyzfehjqxlhdgpma:YOUR_URL_ENCODED_PASSWORD@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
}
