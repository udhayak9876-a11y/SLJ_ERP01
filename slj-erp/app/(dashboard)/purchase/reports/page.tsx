import Link from "next/link";
import { getPurchaseRegister, getPurchaseReturnRegister } from "@/lib/actions/purchaseReports";
import { getOldMetalSummary } from "@/lib/actions/oldMetalPurchase";
import { PrintButton } from "@/components/shared/PrintButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

export default async function PurchaseReportsPage() {
  const [purchases, returns, oldMetal] = await Promise.all([
    getPurchaseRegister(),
    getPurchaseReturnRegister(),
    getOldMetalSummary(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/purchase" className="text-sm text-muted-foreground hover:underline">← Purchase</Link>
          <h2 className="text-xl font-semibold mt-1">Purchase Reports</h2>
        </div>
        <PrintButton />
      </div>

      <div>
        <h3 className="font-medium mb-2">Purchase Register</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Bill No.</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{formatDateDDMMYYYY(b.billDate)}</TableCell>
                <TableCell className="font-mono text-xs">{b.billNumber}</TableCell>
                <TableCell>{b.supplier.companyName}</TableCell>
                <TableCell><WeightDisplay weight={Number(b.totalWeight)} /></TableCell>
                <TableCell><IndianCurrency amount={Number(b.totalAmount)} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-medium mb-2">Old Metal Summary</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metal</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {oldMetal.byMetal.map((row) => (
              <TableRow key={row.metalType}>
                <TableCell>{row.metalType}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell><WeightDisplay weight={row.weight} /></TableCell>
                <TableCell><IndianCurrency amount={row.amount} /></TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-gray-50">
              <TableCell>Total</TableCell>
              <TableCell>{oldMetal.totals.count}</TableCell>
              <TableCell><WeightDisplay weight={oldMetal.totals.weight} /></TableCell>
              <TableCell><IndianCurrency amount={oldMetal.totals.amount} /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-medium mb-2">Purchase Return Register</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Return No.</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Items</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {returns.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDateDDMMYYYY(r.returnDate)}</TableCell>
                <TableCell className="font-mono text-xs">{r.returnNumber}</TableCell>
                <TableCell>{r.supplier.companyName}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>{r.items.length}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
