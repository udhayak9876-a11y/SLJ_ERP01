import Link from "next/link";
import { getVouchers } from "@/lib/actions/vouchers";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function VouchersPage() {
  const vouchers = await getVouchers();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
          <h2 className="text-xl font-semibold mt-1">Vouchers</h2>
        </div>
        <Link href="/accounting/vouchers/new?type=RECEIPT">
          <Button>New Voucher</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Party</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vouchers.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="font-mono text-xs">{v.voucherNumber}</TableCell>
              <TableCell>{formatDateDDMMYYYY(v.date)}</TableCell>
              <TableCell><Badge>{v.type}</Badge></TableCell>
              <TableCell>{v.partyName}</TableCell>
              <TableCell><IndianCurrency amount={Number(v.amount)} /></TableCell>
              <TableCell>{v.paymentMode}</TableCell>
              <TableCell>
                <Link href={`/accounting/vouchers/${v.id}/print`}>
                  <Button variant="ghost" size="sm">Print</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {vouchers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No vouchers yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
