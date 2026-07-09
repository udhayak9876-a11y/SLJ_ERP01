import Link from "next/link";
import { getLedgerAccounts } from "@/lib/actions/ledger";
import { JournalEntryForm } from "@/components/accounting/JournalEntryForm";

export default async function NewJournalPage() {
  const accounts = await getLedgerAccounts();
  return (
    <div>
      <Link href="/accounting/journal" className="text-sm text-muted-foreground hover:underline">← Journal</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Manual Journal Entry</h2>
      <JournalEntryForm accounts={accounts} />
    </div>
  );
}
