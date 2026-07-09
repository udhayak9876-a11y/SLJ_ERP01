import Link from "next/link";
import { Suspense } from "react";
import { getGstr1Report } from "@/lib/actions/complianceReports";
import { getShopSettings } from "@/lib/actions/settings";
import { ReportPeriodFilter } from "@/components/reports/ReportPeriodFilter";
import { ReportFilterSkeleton } from "@/components/reports/ReportFilterSkeleton";
import { PrintButton } from "@/components/shared/PrintButton";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { monthOptions, parseReportPeriod } from "@/lib/utils/reportPeriod";

export default async function Gstr1Page({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const { year, month } = parseReportPeriod(
    searchParams.year,
    searchParams.month
  );
  const [report, settings] = await Promise.all([
    getGstr1Report(year, month),
    getShopSettings(),
  ]);
  const options = monthOptions();

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
          <h2 className="mt-1 text-xl font-semibold">GSTR-1 — Outward Supplies</h2>
          <p className="text-sm text-muted-foreground">
            {settings.shopName} · {report.periodLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <Suspense fallback={<ReportFilterSkeleton />}>
            <ReportPeriodFilter year={year} month={month} options={options} />
          </Suspense>
          <Button asChild variant="outline" className="no-print">
            <a href={`/api/reports/gstr-1?year=${year}&month=${month}`}>
              Download CSV
            </a>
          </Button>
          <PrintButton />
        </div>
      </div>

      <div className="hidden print:block text-center mb-4">
        <h2 className="text-lg font-bold">{settings.shopName}</h2>
        <p>GSTR-1 — {report.periodLabel}</p>
      </div>

      <section>
        <h3 className="mb-2 font-medium">B2B Invoices ({report.b2b.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>GSTIN</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Invoice</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Taxable</TableHead>
              <TableHead>CGST</TableHead>
              <TableHead>SGST</TableHead>
              <TableHead>IGST</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.b2b.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground">
                  No B2B invoices this month
                </TableCell>
              </TableRow>
            ) : (
              report.b2b.map((row) => (
                <TableRow key={`${row.invoiceNumber}-${row.gstin}`}>
                  <TableCell className="font-mono text-xs">{row.gstin}</TableCell>
                  <TableCell>{row.receiverName}</TableCell>
                  <TableCell className="font-mono text-xs">{row.invoiceNumber}</TableCell>
                  <TableCell>{row.invoiceDate}</TableCell>
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
                  <TableCell>
                    <IndianCurrency amount={row.invoiceValue} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section>
        <h3 className="mb-2 font-medium">B2C Summary (Consolidated)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Place of Supply</TableHead>
              <TableHead>Rate %</TableHead>
              <TableHead>Invoices</TableHead>
              <TableHead>Taxable</TableHead>
              <TableHead>CGST</TableHead>
              <TableHead>SGST</TableHead>
              <TableHead>IGST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {report.b2c.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No B2C sales this month
                </TableCell>
              </TableRow>
            ) : (
              report.b2c.map((row) => (
                <TableRow key={`${row.placeOfSupply}-${row.rate}`}>
                  <TableCell>{row.placeOfSupply}</TableCell>
                  <TableCell>{row.rate.toFixed(2)}</TableCell>
                  <TableCell>{row.invoiceCount}</TableCell>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>

      <section className="rounded border bg-gray-50 p-4">
        <h3 className="mb-2 font-medium">Period Totals</h3>
        <div className="grid gap-2 md:grid-cols-3">
          <p>
            Taxable: <IndianCurrency amount={report.totals.taxableValue} />
          </p>
          <p>
            CGST: <IndianCurrency amount={report.totals.cgst} />
          </p>
          <p>
            SGST: <IndianCurrency amount={report.totals.sgst} />
          </p>
          <p>
            IGST: <IndianCurrency amount={report.totals.igst} />
          </p>
          <p className="font-semibold">
            Invoice Value: <IndianCurrency amount={report.totals.invoiceValue} />
          </p>
        </div>
      </section>
    </div>
  );
}
