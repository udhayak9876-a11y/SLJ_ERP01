import Link from "next/link";
import { Suspense } from "react";
import { getHsnSummary } from "@/lib/actions/complianceReports";
import { getShopSettings } from "@/lib/actions/settings";
import { ReportPeriodFilter } from "@/components/reports/ReportPeriodFilter";
import { ReportFilterSkeleton } from "@/components/reports/ReportFilterSkeleton";
import { PrintButton } from "@/components/shared/PrintButton";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { monthOptions, parseReportPeriod } from "@/lib/utils/reportPeriod";

export default async function HsnReportPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const { year, month } = parseReportPeriod(
    searchParams.year,
    searchParams.month
  );
  const [report, settings] = await Promise.all([
    getHsnSummary(year, month),
    getShopSettings(),
  ]);
  const options = monthOptions();

  const totals = report.rows.reduce(
    (acc, row) => ({
      value: acc.value + row.totalValue,
      taxable: acc.taxable + row.taxableValue,
      cgst: acc.cgst + row.cgst,
      sgst: acc.sgst + row.sgst,
      igst: acc.igst + row.igst,
      lines: acc.lines + row.lineCount,
    }),
    { value: 0, taxable: 0, cgst: 0, sgst: 0, igst: 0, lines: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div>
          <Link
            href="/reports"
            className="text-sm text-muted-foreground hover:underline"
          >
            ← Reports
          </Link>
          <h2 className="mt-1 text-xl font-semibold">HSN Summary</h2>
          <p className="text-sm text-muted-foreground">
            {settings.shopName} · {report.periodLabel}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <Suspense fallback={<ReportFilterSkeleton />}>
            <ReportPeriodFilter year={year} month={month} options={options} />
          </Suspense>
          <PrintButton />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>HSN</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>UQC</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Total Value</TableHead>
            <TableHead>Taxable</TableHead>
            <TableHead>CGST</TableHead>
            <TableHead>SGST</TableHead>
            <TableHead>IGST</TableHead>
            <TableHead>Lines</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center text-muted-foreground">
                No sales this month
              </TableCell>
            </TableRow>
          ) : (
            <>
              {report.rows.map((row) => (
                <TableRow key={row.hsnCode}>
                  <TableCell className="font-mono">{row.hsnCode}</TableCell>
                  <TableCell>{row.description}</TableCell>
                  <TableCell>{row.uqc}</TableCell>
                  <TableCell>
                    {row.uqc === "GMS" ? (
                      <WeightDisplay weight={row.totalQuantity} />
                    ) : (
                      row.totalQuantity
                    )}
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.totalValue} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.taxableValue} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.cgst} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.sgst} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.igst} />
                  </TableCell>
                  <TableCell>{row.lineCount}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={3}>Total</TableCell>
                <TableCell>—</TableCell>
                <TableCell>
                  <IndianCurrency amount={totals.value} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={totals.taxable} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={totals.cgst} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={totals.sgst} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={totals.igst} />
                </TableCell>
                <TableCell>{totals.lines}</TableCell>
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
