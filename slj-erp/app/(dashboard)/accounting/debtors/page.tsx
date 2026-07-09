import Link from "next/link";
import { getDebtorLedger } from "@/lib/actions/debtorCreditor";
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

export default async function DebtorsPage() {
  const debtors = await getDebtorLedger();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
          <h2 className="text-xl font-semibold mt-1">Debtor Ledger</h2>
        </div>
        <PrintButton />
      </div>

      {debtors.map(({ customer, totalOutstanding, ageing, bills }) => (
        <div key={customer.id} className="border rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <div>
              <p className="font-semibold">{customer.name}</p>
              <p className="text-sm text-muted-foreground">{customer.phone}</p>
            </div>
            <IndianCurrency amount={totalOutstanding} className="text-lg font-bold text-red-600" />
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs mb-3">
            <span>0-30d: <IndianCurrency amount={ageing.days30} /></span>
            <span>31-60d: <IndianCurrency amount={ageing.days60} /></span>
            <span>61-90d: <IndianCurrency amount={ageing.days90} /></span>
            <span>90+d: <IndianCurrency amount={ageing.over90} /></span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bills.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-mono text-xs">{b.billNumber}</TableCell>
                  <TableCell>{formatDateDDMMYYYY(b.billDate)}</TableCell>
                  <TableCell><IndianCurrency amount={Number(b.balanceDue)} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      {debtors.length === 0 && (
        <p className="text-center text-muted-foreground py-8">No outstanding debtors</p>
      )}
    </div>
  );
}
