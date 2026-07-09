import { NextRequest, NextResponse } from "next/server";
import { buildGstr1Csv } from "@/lib/actions/complianceReports";
import { parseReportPeriod } from "@/lib/utils/reportPeriod";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const { year, month } = parseReportPeriod(
    searchParams.get("year") ?? undefined,
    searchParams.get("month") ?? undefined
  );

  const csv = await buildGstr1Csv(year, month);
  const filename = `GSTR1_${year}-${String(month).padStart(2, "0")}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
