import Link from "next/link";
import { getCashBook } from "@/lib/actions/cashBook";
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

export default async function CashBookPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const { opening, lines, closing } = await getCashBook(monthStart, now);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
          <h2 className="text-xl font-semibold mt-1">Cash Book</h2>
          <p className="text-sm text-muted-foreground">Current month</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div className="rounded border p-3">
          <p className="text-muted-foreground">Opening</p>
          <IndianCurrency amount={opening} className="text-lg font-bold" />
        </div>
        <div className="rounded border p-3">
          <p className="text-muted-foreground">Closing</p>
          <IndianCurrency amount={closing} className="text-lg font-bold" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Entry</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Credit</TableHead>
            <TableHead>Balance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((l, i) => (
            <TableRow key={i}>
              <TableCell>{formatDateDDMMYYYY(l.date)}</TableCell>
              <TableCell className="font-mono text-xs">{l.entryNumber}</TableCell>
              <TableCell>{l.description}</TableCell>
              <TableCell>{l.debit > 0 ? <IndianCurrency amount={l.debit} /> : "—"}</TableCell>
              <TableCell>{l.credit > 0 ? <IndianCurrency amount={l.credit} /> : "—"}</TableCell>
              <TableCell><IndianCurrency amount={l.balance} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
