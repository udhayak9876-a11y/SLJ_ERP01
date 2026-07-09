import Link from "next/link";
import { Suspense } from "react";
import { getDailySalesSummary } from "@/lib/actions/complianceReports";
import { getShopSettings } from "@/lib/actions/settings";
import { DailySalesSummaryView } from "@/components/reports/DailySalesSummaryView";
import { ReportDateFilter } from "@/components/reports/ReportDateFilter";
import { ReportFilterSkeleton } from "@/components/reports/ReportFilterSkeleton";
import { PrintButton } from "@/components/shared/PrintButton";
import { parseReportDate } from "@/lib/utils/reportPeriod";

export default async function DailySalesPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = parseReportDate(searchParams.date);
  const [summary, settings] = await Promise.all([
    getDailySalesSummary(date),
    getShopSettings(),
  ]);

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
          <h2 className="mt-1 text-xl font-semibold">Daily Sales Summary</h2>
          <p className="text-sm text-muted-foreground">
            Legacy day-end format · {summary.date}
          </p>
        </div>
        <div className="flex items-end gap-2">
          <Suspense fallback={<ReportFilterSkeleton />}>
            <ReportDateFilter dateISO={summary.dateISO} />
          </Suspense>
          <PrintButton />
        </div>
      </div>

      <DailySalesSummaryView summary={summary} shopName={settings.shopName} />
    </div>
  );
}
