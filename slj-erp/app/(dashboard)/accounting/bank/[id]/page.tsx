import Link from "next/link";
import { notFound } from "next/navigation";
import { getBankReconciliation } from "@/lib/actions/bankBook";
import { PrintButton } from "@/components/shared/PrintButton";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function BankDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let data;
  try {
    data = await getBankReconciliation(params.id);
  } catch {
    notFound();
  }

  const { bank, bookBalance, clearedBalance, unclearedItems } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounting/bank" className="text-sm text-muted-foreground hover:underline">← Bank</Link>
          <h2 className="text-xl font-semibold mt-1">{bank.bankName}</h2>
          <p className="text-sm text-muted-foreground font-mono">{bank.accountNumber}</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground">Book Balance</p>
          <IndianCurrency amount={bookBalance} className="text-xl font-bold" />
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground">Cleared Balance</p>
          <IndianCurrency amount={clearedBalance} className="text-xl font-bold" />
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">Bank Reconciliation — Uncleared Items</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Debit</TableHead>
              <TableHead>Credit</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unclearedItems.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{formatDateDDMMYYYY(t.date)}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell>{Number(t.debit) > 0 ? <IndianCurrency amount={Number(t.debit)} /> : "—"}</TableCell>
                <TableCell>{Number(t.credit) > 0 ? <IndianCurrency amount={Number(t.credit)} /> : "—"}</TableCell>
                <TableCell><Badge variant="secondary">Uncleared</Badge></TableCell>
              </TableRow>
            ))}
            {unclearedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  All transactions cleared
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
