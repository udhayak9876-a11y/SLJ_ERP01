import Link from "next/link";
import { getJournalEntries } from "@/lib/actions/journal";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function JournalPage() {
  const entries = await getJournalEntries();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
          <h2 className="text-xl font-semibold mt-1">Journal Entries</h2>
        </div>
        <Link href="/accounting/journal/new">
          <Button>Manual Entry</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entry No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Debit</TableHead>
            <TableHead>Credit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((e) => {
            const debit = e.lines.reduce((s, l) => s + Number(l.debitAmount), 0);
            const credit = e.lines.reduce((s, l) => s + Number(l.creditAmount), 0);
            return (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs">{e.entryNumber}</TableCell>
                <TableCell>{formatDateDDMMYYYY(e.entryDate)}</TableCell>
                <TableCell>{e.description}</TableCell>
                <TableCell><IndianCurrency amount={debit} /></TableCell>
                <TableCell><IndianCurrency amount={credit} /></TableCell>
              </TableRow>
            );
          })}
          {entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No journal entries — confirm a sales/purchase bill to auto-post
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
