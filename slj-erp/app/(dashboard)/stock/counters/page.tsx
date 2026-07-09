import Link from "next/link";
import { getCounters } from "@/lib/actions/counters";
import { getCounterStockReport } from "@/lib/actions/counters";
import { CountersTable } from "@/components/stock/CountersTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

export default async function CountersPage() {
  const [counters, stockReport] = await Promise.all([
    getCounters(),
    getCounterStockReport(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Counter Master</h2>
          <p className="text-sm text-muted-foreground">
            Physical display counters in the shop
          </p>
        </div>
        <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
          ← Stock
        </Link>
      </div>

      <CountersTable counters={counters} />

      <div>
        <h3 className="font-medium mb-3">Counter Stock Report</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Counter</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockReport.map(({ counter, pieces, weight, value }) => (
              <TableRow key={counter.id}>
                <TableCell>{counter.counterName}</TableCell>
                <TableCell>{counter.location}</TableCell>
                <TableCell>{pieces}</TableCell>
                <TableCell>
                  <WeightDisplay weight={weight} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={value} />
                </TableCell>
              </TableRow>
            ))}
            {stockReport.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No counter stock data
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
