import Link from "next/link";
import { getLedgerAccounts } from "@/lib/actions/ledger";
import { LedgerAccountsTable } from "@/components/accounting/LedgerAccountsTable";

export default async function AccountsPage() {
  const accounts = await getLedgerAccounts();
  return (
    <div>
      <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Chart of Accounts</h2>
      <LedgerAccountsTable accounts={accounts} />
    </div>
  );
}
