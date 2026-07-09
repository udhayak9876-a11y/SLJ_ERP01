import Link from "next/link";
import {
  getChitCollectionSummary,
  getClosedMembers,
  getChitPayments,
} from "@/lib/actions/chitPayments";
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

export default async function ChitReportsPage() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [summary, closedMembers, recentPayments] = await Promise.all([
    getChitCollectionSummary(monthStart, now),
    getClosedMembers(),
    getChitPayments({ fromDate: monthStart, toDate: now }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/schemes" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>
          <h2 className="text-xl font-semibold mt-1">Scheme Reports</h2>
          <p className="text-sm text-muted-foreground">Current month</p>
        </div>
        <PrintButton />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground">Collections This Month</p>
          <p className="text-2xl font-bold">{summary.totalCount}</p>
          <IndianCurrency amount={summary.totalAmount} className="text-lg" />
        </div>
        <div className="rounded border p-4">
          <p className="text-sm text-muted-foreground">Matured Members</p>
          <p className="text-2xl font-bold">{closedMembers.length}</p>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-2">By Payment Mode</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mode</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.byMode.map((row) => (
              <TableRow key={row.mode}>
                <TableCell>{row.mode}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell><IndianCurrency amount={row.amount} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-medium mb-2">By Scheme</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Scheme</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {summary.byScheme.map((row) => (
              <TableRow key={row.schemeName}>
                <TableCell>{row.schemeName}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell><IndianCurrency amount={row.amount} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-medium mb-2">Recent Collections</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Inst.</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Mode</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayments.slice(0, 30).map((p) => (
              <TableRow key={p.id}>
                <TableCell>{formatDateDDMMYYYY(p.paymentDate)}</TableCell>
                <TableCell className="font-mono text-xs">{p.receiptNumber}</TableCell>
                <TableCell>{p.member.customer.name}</TableCell>
                <TableCell>#{p.instalmentNumber}</TableCell>
                <TableCell><IndianCurrency amount={Number(p.amount)} /></TableCell>
                <TableCell>{p.paymentMode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
