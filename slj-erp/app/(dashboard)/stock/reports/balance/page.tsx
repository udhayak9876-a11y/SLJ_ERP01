import Link from "next/link";
import { getBalanceStockReport } from "@/lib/actions/stockReports";
import { getLotWiseStockReport } from "@/lib/actions/lots";
import { PrintButton } from "@/components/shared/PrintButton";
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

export default async function BalanceStockReportPage() {
  const [{ rows, totals }, lotReport] = await Promise.all([
    getBalanceStockReport(),
    getLotWiseStockReport(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
            ← Stock
          </Link>
          <h2 className="text-xl font-semibold mt-1">Balance Stock Report</h2>
        </div>
        <PrintButton />
      </div>

      <div>
        <h3 className="font-medium mb-2">By Category</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Weight</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.category}>
                <TableCell>{r.category}</TableCell>
                <TableCell>{r.pieces}</TableCell>
                <TableCell>
                  <WeightDisplay weight={r.weight} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={r.value} />
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold bg-gray-50">
              <TableCell>Total</TableCell>
              <TableCell>{totals.pieces}</TableCell>
              <TableCell>
                <WeightDisplay weight={totals.weight} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={totals.value} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div>
        <h3 className="font-medium mb-2">Lot-wise Stock (Active)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Lot</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Pieces</TableHead>
              <TableHead>Weight</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lotReport.map(({ lot, activePieces, activeWeight }) => (
              <TableRow key={lot.id}>
                <TableCell className="font-mono text-xs">{lot.lotNumber}</TableCell>
                <TableCell>{lot.lotDate.toLocaleDateString("en-IN")}</TableCell>
                <TableCell>{lot.supplier?.companyName ?? "—"}</TableCell>
                <TableCell>{activePieces}</TableCell>
                <TableCell>
                  <WeightDisplay weight={activeWeight} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
