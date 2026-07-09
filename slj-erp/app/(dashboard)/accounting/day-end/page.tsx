import Link from "next/link";
import { getDayEnd, getDayEndRecords } from "@/lib/actions/dayEnd";
import { DayEndPanel } from "@/components/accounting/DayEndPanel";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function DayEndPage() {
  const today = new Date();
  const [todayEnd, records] = await Promise.all([
    getDayEnd(today),
    getDayEndRecords(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/accounting" className="text-sm text-muted-foreground hover:underline">← Accounting</Link>
        <h2 className="text-xl font-semibold mt-1">Day-End Processing</h2>
      </div>

      <DayEndPanel
        isLocked={todayEnd?.isDayLocked ?? false}
        existingReport={todayEnd?.dayEndReport as Record<string, unknown> | null}
      />

      <div>
        <h3 className="font-medium mb-2">Recent Day-End Records</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sales</TableHead>
              <TableHead>Purchases</TableHead>
              <TableHead>Closing Cash</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{formatDateDDMMYYYY(r.date)}</TableCell>
                <TableCell><IndianCurrency amount={Number(r.totalSales)} /></TableCell>
                <TableCell><IndianCurrency amount={Number(r.totalPurchases)} /></TableCell>
                <TableCell><IndianCurrency amount={Number(r.closingCash)} /></TableCell>
                <TableCell>
                  <Badge variant={r.isDayLocked ? "default" : "secondary"}>
                    {r.isDayLocked ? "Locked" : "Open"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
