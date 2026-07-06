/**
 * Date helpers — display format is DD-MM-YYYY everywhere.
 */

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}-${month}-${year}`;
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}-${month}-${d.getFullYear()} ${time}`;
}

/** Today's date in Asia/Kolkata as a YYYY-MM-DD string (for <input type="date">). */
export function todayISO(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

/** Today's date (Asia/Kolkata) as a UTC-midnight Date suitable for @db.Date columns. */
export function todayDateOnly(): Date {
  return new Date(`${todayISO()}T00:00:00.000Z`);
}

/** Converts a YYYY-MM-DD string to a UTC-midnight Date for @db.Date columns. */
export function dateOnlyFromISO(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`);
}

/** Today's date formatted for display: DD-MM-YYYY. */
export function todayDisplay(): string {
  const [y, m, d] = todayISO().split("-");
  return `${d}-${m}-${y}`;
}
