import Link from "next/link";
import { getCreditorLedger } from "@/lib/actions/debtorCreditor";
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

export default async function CreditorsPage() {
  const creditors = await getCreditorLedger();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
          <h2 className="text-xl font-semibold mt-1">Creditor Ledger</h2>
        </div>
        <PrintButton />
      </div>

      {creditors.map(({ supplier, totalPayable, bills }) => (
        <div key={supplier.id} className="border rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-semibold">{supplier.companyName}</p>
              <p className="text-sm text-muted-foreground">{supplier.supplierCode}</p>
            </div>
            <IndianCurrency amount={totalPayable} className="text-lg font-bold" />
          </div>
          {bills.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.billNumber}</TableCell>
                    <TableCell>{formatDateDDMMYYYY(b.billDate)}</TableCell>
                    <TableCell><IndianCurrency amount={Number(b.totalAmount)} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ))}

      {creditors.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No creditor balances</p>
      )}
    </div>
  );
}
