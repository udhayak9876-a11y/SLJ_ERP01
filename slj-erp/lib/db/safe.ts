import {
  getDatabaseConfigError,
  isDatabaseConfigured,
  validateDatabaseUrls,
} from "./validate";

export { getDatabaseConfigError, isDatabaseConfigured, validateDatabaseUrls };
export { getDatabaseConnectionHint } from "./validate";

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
