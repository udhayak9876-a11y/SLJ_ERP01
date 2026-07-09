import Link from "next/link";
import { Suspense } from "react";
import { getLedgerAccounts } from "@/lib/actions/ledger";
import { VoucherForm } from "@/components/accounting/VoucherForm";

export default async function NewVoucherPage() {
  const accounts = await getLedgerAccounts();
  return (
    <div>
      <Link href="/accounting/vouchers" className="text-sm text-muted-foreground hover:underline">← Vouchers</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">New Voucher</h2>
      <Suspense>
        <VoucherForm accounts={accounts} />
      </Suspense>
    </div>
  );
}
