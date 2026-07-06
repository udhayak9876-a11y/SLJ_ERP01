import { prisma } from "@/lib/prisma";
import { getTodayRate } from "@/lib/data";
import { RateForm } from "@/components/rates/RateForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils/date";
import { formatINR } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default async function RatesPage() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [todayRate, history] = await Promise.all([
    getTodayRate(),
    prisma.dailyRate.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: "desc" },
    }),
  ]);

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="mb-4 text-xl font-bold text-navy">
          Daily Gold &amp; Silver Rates
        </h1>
        <RateForm
          existing={
            todayRate
              ? {
                  gold24kRate: Number(todayRate.gold24kRate),
                  gold22kRate: Number(todayRate.gold22kRate),
                  gold18kRate: Number(todayRate.gold18kRate),
                  silverRate: Number(todayRate.silverRate),
                  notes: todayRate.notes ?? "",
                }
              : null
          }
        />
      </div>

      <div>
        <h2 className="mb-3 text-base font-semibold text-navy">
          Rate History (last 30 days)
        </h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">24K (₹/g)</TableHead>
                <TableHead className="text-right">22K (₹/g)</TableHead>
                <TableHead className="text-right">18K (₹/g)</TableHead>
                <TableHead className="text-right">Silver (₹/g)</TableHead>
                <TableHead>Entered By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                    No rates entered yet.
                  </TableCell>
                </TableRow>
              )}
              {history.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell className="font-medium tabular-nums">
                    {formatDate(rate.date)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatINR(Number(rate.gold24kRate))}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatINR(Number(rate.gold22kRate))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatINR(Number(rate.gold18kRate))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatINR(Number(rate.silverRate))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {rate.enteredBy}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
