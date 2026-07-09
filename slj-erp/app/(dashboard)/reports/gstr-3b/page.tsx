import Link from "next/link";
import { Suspense } from "react";
import { getGstr3BSummary } from "@/lib/actions/complianceReports";
import { getShopSettings } from "@/lib/actions/settings";
import { ReportPeriodFilter } from "@/components/reports/ReportPeriodFilter";
import { ReportFilterSkeleton } from "@/components/reports/ReportFilterSkeleton";
import { PrintButton } from "@/components/shared/PrintButton";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { monthOptions, parseReportPeriod } from "@/lib/utils/reportPeriod";

export default async function Gstr3BPage({
  searchParams,
}: {
  searchParams: { year?: string; month?: string };
}) {
  const { year, month } = parseReportPeriod(
    searchParams.year,
    searchParams.month
  );
  const [report, settings] = await Promise.all([
    getGstr3BSummary(year, month),
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
          <h2 className="mt-1 text-xl font-semibold">GSTR-3B Summary</h2>
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
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Taxable Value</TableHead>
            <TableHead className="text-right">CGST</TableHead>
            <TableHead className="text-right">SGST</TableHead>
            <TableHead className="text-right">IGST</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">
              3.1 — Outward taxable supplies (other than zero rated, nil rated, exempted)
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardTaxable} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardCgst} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardSgst} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardIgst} />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">4 — Eligible ITC (Input Tax Credit)</TableCell>
            <TableCell className="text-right">—</TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={0} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={0} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={0} />
            </TableCell>
          </TableRow>
          <TableRow className="bg-gray-50 font-semibold">
            <TableCell>Net Tax Payable (Outward − ITC)</TableCell>
            <TableCell />
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardCgst} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardSgst} />
            </TableCell>
            <TableCell className="text-right">
              <IndianCurrency amount={report.outwardIgst} />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-medium">Total tax payable: <IndianCurrency amount={report.totalTaxPayable} /></p>
        <p className="mt-1 text-muted-foreground">{report.note}</p>
      </div>
    </div>
  );
}
