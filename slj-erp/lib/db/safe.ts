export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL ?? "";
  return Boolean(url) && !url.includes("[YOUR_DB_PASSWORD]");
}

export function getDatabaseConfigError(): string | null {
  if (!isDatabaseConfigured()) {
    return "DATABASE_URL is not set in Vercel environment variables.";
  }
  if (!process.env.DIRECT_URL) {
    return "DIRECT_URL is not set in Vercel environment variables.";
  }
  return null;
}

export async function safeDbCall<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
): Promise<{ data: T; error: string | null }> {
  const configError = getDatabaseConfigError();
  if (configError) {
    return { data: fallback, error: configError };
  }

  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    console.error(`[slj-erp] ${label}:`, message);
    return { data: fallback, error: message };
  }
}
