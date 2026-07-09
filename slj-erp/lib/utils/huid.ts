/** BIS Hallmark Unique Identification Number — 6 alphanumeric chars */
const HUID_PATTERN = /^[A-Z0-9]{6}$/;

export function validateHuid(huid: string): boolean {
  return HUID_PATTERN.test(huid.toUpperCase());
}

export function normalizeHuid(huid: string): string {
  return huid.toUpperCase().trim();
}

export function formatHuidError(): string {
  return "HUID must be 6 alphanumeric characters (e.g. AA1B2C)";
}
