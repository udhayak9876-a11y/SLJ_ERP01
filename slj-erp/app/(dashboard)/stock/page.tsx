import { getStockDashboardStats } from "@/lib/actions/stockReports";
import { getTagStatusReport } from "@/lib/actions/tags";
import { StockOverview } from "@/components/stock/StockOverview";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeightDisplay } from "@/components/shared/WeightDisplay";

export default async function StockPage() {
  const [stats, statusReport] = await Promise.all([
    getStockDashboardStats(),
    getTagStatusReport(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold">Stock & Inventory</h2>
        <p className="text-sm text-muted-foreground">
          Tag management, lots, counters & reports
        </p>
      </div>

      <StockOverview stats={stats} />

      <div>
        <h3 className="font-medium mb-3">Tag Status Summary</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Status</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statusReport.map((row) => (
              <TableRow key={row.status}>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.count}</TableCell>
                <TableCell>
                  <WeightDisplay weight={row.weight} />
                </TableCell>
              </TableRow>
            ))}
            {statusReport.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No tags in system
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
