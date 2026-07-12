import { prisma } from "@/lib/prisma";

/** Tables required for the full ERP (all migration phases). */
export const REQUIRED_TABLES = [
  "ShopSettings",
  "Item",
  "Customer",
  "DailyRate",
  "SalesBill",
  "SalesBillItem",
  "Supplier",
  "Counter",
  "Lot",
  "Tag",
  "StockMovement",
  "PurchaseBill",
  "PurchaseBillItem",
  "OldMetalPurchase",
  "PurchaseReturn",
  "PurchaseReturnItem",
  "LedgerAccount",
  "JournalEntry",
  "JournalEntryLine",
  "BankAccount",
  "BankTransaction",
  "Voucher",
  "DayEnd",
  "ChitScheme",
  "ChitMember",
  "ChitPayment",
] as const;

export type MigrationStatus = {
  complete: boolean;
  existing: string[];
  missing: string[];
};

export async function checkMigrationStatus(): Promise<MigrationStatus> {
  try {
    const rows = await prisma.$queryRaw<{ table_name: string }[]>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
    `;
    const existingSet = new Set(rows.map((r) => r.table_name));
    const existing = REQUIRED_TABLES.filter((t) => existingSet.has(t));
    const missing = REQUIRED_TABLES.filter((t) => !existingSet.has(t));
    return {
      complete: missing.length === 0,
      existing,
      missing,
    };
  } catch {
    return {
      complete: false,
      existing: [],
      missing: [...REQUIRED_TABLES],
    };
  }
}

export function migrationInstructions(missing: string[]): string[] {
  if (missing.length === 0) return [];

  const steps = [
    "Open Supabase SQL Editor: https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new",
    "Run each migration file below in order (copy full file → Run):",
  ];

  const needsInit =
    missing.includes("ShopSettings") ||
    missing.includes("Item") ||
    missing.includes("SalesBill");

  if (needsInit) {
    steps.push(
      "1. supabase/migrations/20260706120000_init.sql (fresh DB)",
      "   OR 20260707070000_repair_schema.sql if types already exist"
    );
  }

  const moduleSteps: [string, string[]][] = [
    ["20260709120000_stock_module.sql", ["Supplier", "Tag", "Lot"]],
    ["20260709140000_purchase_module.sql", ["PurchaseBill", "OldMetalPurchase"]],
    ["20260709160000_accounting_module.sql", ["LedgerAccount", "DayEnd"]],
    ["20260709180000_chit_scheme_module.sql", ["ChitScheme", "ChitPayment"]],
  ];

  let n = needsInit ? 2 : 1;
  for (const [file, markers] of moduleSteps) {
    if (markers.some((t) => missing.includes(t))) {
      steps.push(`${n}. supabase/migrations/${file}`);
      n++;
    }
  }

  steps.push("After running SQL → Redeploy on Vercel (or refresh the page).");
  return steps;
}
