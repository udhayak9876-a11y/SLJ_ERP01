import Link from "next/link";
import { getTrialBalance } from "@/lib/actions/debtorCreditor";
import { PrintButton } from "@/components/shared/PrintButton";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function TrialBalancePage() {
  const now = new Date();
  const fyStart = new Date(now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1, 3, 1);
  const rows = await getTrialBalance(fyStart, now);

  const totalDebit = rows.reduce((s, r) => s + r.closingDebit, 0);
  const totalCredit = rows.reduce((s, r) => s + r.closingCredit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
          <h2 className="text-xl font-semibold mt-1">Trial Balance</h2>
          <p className="text-sm text-muted-foreground">Current financial year to date</p>
        </div>
        <PrintButton />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Account</TableHead>
            <TableHead>Period Dr</TableHead>
            <TableHead>Period Cr</TableHead>
            <TableHead>Closing Dr</TableHead>
            <TableHead>Closing Cr</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.account.id}>
              <TableCell className="font-mono text-xs">{r.account.accountCode}</TableCell>
              <TableCell>{r.account.accountName}</TableCell>
              <TableCell>{r.periodDebit > 0 ? <IndianCurrency amount={r.periodDebit} /> : "—"}</TableCell>
              <TableCell>{r.periodCredit > 0 ? <IndianCurrency amount={r.periodCredit} /> : "—"}</TableCell>
              <TableCell>{r.closingDebit > 0 ? <IndianCurrency amount={r.closingDebit} /> : "—"}</TableCell>
              <TableCell>{r.closingCredit > 0 ? <IndianCurrency amount={r.closingCredit} /> : "—"}</TableCell>
            </TableRow>
          ))}
          <TableRow className="font-semibold bg-gray-50">
            <TableCell colSpan={4}>Total</TableCell>
            <TableCell><IndianCurrency amount={totalDebit} /></TableCell>
            <TableCell><IndianCurrency amount={totalCredit} /></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
