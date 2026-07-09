import Link from "next/link";
import { Suspense } from "react";
import { getSalesRegister } from "@/lib/actions/complianceReports";
import { getShopSettings } from "@/lib/actions/settings";
import { ReportPeriodFilter } from "@/components/reports/ReportPeriodFilter";
import { ReportFilterSkeleton } from "@/components/reports/ReportFilterSkeleton";
import { PrintButton } from "@/components/shared/PrintButton";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { monthOptions, parseReportPeriod } from "@/lib/utils/reportPeriod";

export default async function SalesRegisterPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string; filter?: string };
}) {
  const { year, month } = parseReportPeriod(
    searchParams.year,
    searchParams.month
  );
  const filter =
    searchParams.filter === "B2B" || searchParams.filter === "B2C"
      ? searchParams.filter
      : "ALL";

  const [report, settings] = await Promise.all([
    getSalesRegister(year, month, filter),
    getShopSettings(),
  ]);
  const options = monthOptions();

  const totals = report.rows.reduce(
    (acc, row) => ({
      gold: acc.gold + row.goldWeight,
      silver: acc.silver + row.silverWeight,
      taxable: acc.taxable + row.taxableAmount,
      total: acc.total + row.totalAmount,
    }),
    { gold: 0, silver: 0, taxable: 0, total: 0 }
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
          <h2 className="mt-1 text-xl font-semibold">B2B / B2C Sales Register</h2>
          <p className="text-sm text-muted-foreground">
            {settings.shopName} · {report.periodLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Suspense fallback={<ReportFilterSkeleton />}>
            <ReportPeriodFilter year={year} month={month} options={options} />
          </Suspense>
          <PrintButton />
        </div>
      </div>

      <div className="flex gap-2 print:hidden">
        {(["ALL", "B2B", "B2C"] as const).map((f) => (
          <Link
            key={f}
            href={`/reports/sales-register?year=${year}&month=${month}&filter=${f}`}
          >
            <Badge variant={filter === f ? "default" : "outline"}>{f}</Badge>
          </Link>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Bill No.</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>GSTIN</TableHead>
            <TableHead>Gold</TableHead>
            <TableHead>Silver</TableHead>
            <TableHead>Taxable</TableHead>
            <TableHead>GST</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {report.rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="text-center text-muted-foreground">
                No sales for selected period
              </TableCell>
            </TableRow>
          ) : (
            <>
              {report.rows.map((row) => (
                <TableRow key={row.billNumber}>
                  <TableCell>{row.billDate}</TableCell>
                  <TableCell className="font-mono text-xs">{row.billNumber}</TableCell>
                  <TableCell>
                    <Badge variant={row.type === "B2B" ? "default" : "secondary"}>
                      {row.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell className="font-mono text-xs">{row.gstin}</TableCell>
                  <TableCell>
                    {row.goldWeight > 0 ? (
                      <WeightDisplay weight={row.goldWeight} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {row.silverWeight > 0 ? (
                      <WeightDisplay weight={row.silverWeight} />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.taxableAmount} />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency
                      amount={row.cgst + row.sgst + row.igst}
                    />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={row.totalAmount} />
                  </TableCell>
                  <TableCell>{row.paymentMode}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-50 font-semibold">
                <TableCell colSpan={5}>Total ({report.rows.length})</TableCell>
                <TableCell>
                  <WeightDisplay weight={totals.gold} />
                </TableCell>
                <TableCell>
                  <WeightDisplay weight={totals.silver} />
                </TableCell>
                <TableCell>
                  <IndianCurrency amount={totals.taxable} />
                </TableCell>
                <TableCell />
                <TableCell>
                  <IndianCurrency amount={totals.total} />
                </TableCell>
                <TableCell />
              </TableRow>
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
