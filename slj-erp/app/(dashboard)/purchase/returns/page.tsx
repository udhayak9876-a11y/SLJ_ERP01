import Link from "next/link";
import { getPurchaseReturns } from "@/lib/actions/purchaseReturns";
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
import { Button } from "@/components/ui/button";

export default async function PurchaseReturnsPage() {
  const returns = await getPurchaseReturns();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/purchase" className="text-sm text-muted-foreground hover:underline">← Purchase</Link>
          <h2 className="text-xl font-semibold mt-1">Purchase Returns</h2>
        </div>
        <Link href="/purchase/returns/new">
          <Button>New Return</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Return No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Original Bill</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {returns.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.returnNumber ?? "Draft"}</TableCell>
              <TableCell>{formatDateDDMMYYYY(r.returnDate)}</TableCell>
              <TableCell>{r.supplier.companyName}</TableCell>
              <TableCell>{r.originalBill.billNumber}</TableCell>
              <TableCell>{r._count.items}</TableCell>
              <TableCell><Badge>{r.status}</Badge></TableCell>
            </TableRow>
          ))}
          {returns.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                No purchase returns
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
