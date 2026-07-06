import Link from "next/link";
import {
  ReceiptText,
  Wallet,
  FileClock,
  AlertCircle,
  Plus,
  Coins,
  UserPlus,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getTodayRate } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { todayDateOnly, formatDateTime } from "@/lib/utils/date";
import { formatINR } from "@/lib/utils/currency";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const today = todayDateOnly();

  const [todayBills, draftCount, outstanding, todayRate, recentBills] =
    await Promise.all([
      prisma.salesBill.findMany({
        where: { billDate: today, status: "CONFIRMED" },
        select: { totalAmount: true, amountPaid: true, paymentMode: true },
      }),
      prisma.salesBill.count({ where: { status: "DRAFT" } }),
      prisma.salesBill.aggregate({
        where: { status: "CONFIRMED" },
        _sum: { balanceDue: true },
      }),
      getTodayRate(),
      prisma.salesBill.findMany({
        where: { status: "CONFIRMED" },
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { customer: { select: { name: true } } },
      }),
    ]);

  const todaySalesTotal = todayBills.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const todayCash = todayBills
    .filter((b) => b.paymentMode === "CASH")
    .reduce((sum, b) => sum + Number(b.amountPaid), 0);
  const outstandingTotal = Number(outstanding._sum.balanceDue ?? 0);

  const stats = [
    {
      label: "Today's Sales",
      value: formatINR(todaySalesTotal),
      sub: `${todayBills.length} bill${todayBills.length === 1 ? "" : "s"}`,
      icon: ReceiptText,
    },
    {
      label: "Cash Collected",
      value: formatINR(todayCash),
      sub: "cash payments today",
      icon: Wallet,
    },
    {
      label: "Pending Drafts",
      value: String(draftCount),
      sub: "bills awaiting confirmation",
      icon: FileClock,
    },
    {
      label: "Outstanding",
      value: formatINR(outstandingTotal),
      sub: "balance due (all confirmed bills)",
      icon: AlertCircle,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1 — stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                {label}
              </CardTitle>
              <Icon className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-navy tabular-nums">{value}</p>
              <p className="text-xs text-muted-foreground">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — gold rate card */}
      {todayRate ? (
        <Card className="border-gold bg-gold-light/30">
          <CardContent className="flex flex-wrap items-center gap-x-10 gap-y-2 p-4">
            <span className="text-sm font-semibold uppercase tracking-wide text-navy">
              Today&apos;s Rates
            </span>
            <span className="text-lg font-bold text-navy tabular-nums">
              22K: {formatINR(Number(todayRate.gold22kRate))}/g
            </span>
            <span className="text-lg font-bold text-navy tabular-nums">
              18K: {formatINR(Number(todayRate.gold18kRate))}/g
            </span>
            <span className="text-lg font-bold text-navy tabular-nums">
              24K: {formatINR(Number(todayRate.gold24kRate))}/g
            </span>
            <span className="text-lg font-bold text-navy tabular-nums">
              Silver: {formatINR(Number(todayRate.silverRate))}/g
            </span>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center justify-between p-4">
            <p className="flex items-center gap-2 font-semibold text-red-700">
              <AlertCircle className="h-5 w-5" />
              Today&apos;s gold rate not entered
            </p>
            <Button asChild>
              <Link href="/rates">Enter Now →</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Row 3 — recent bills */}
      <div>
        <h2 className="mb-2 text-base font-semibold text-navy">Recent Bills</h2>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentBills.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                    No confirmed bills yet.
                  </TableCell>
                </TableRow>
              )}
              {recentBills.map((bill) => (
                <TableRow key={bill.id}>
                  <TableCell>
                    <Link
                      href={`/bills/${bill.id}/print`}
                      className="font-mono font-medium text-navy underline-offset-2 hover:underline"
                    >
                      {bill.billNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {bill.customer?.name ?? bill.walkInName ?? "Walk-in"}
                  </TableCell>
                  <TableCell className="text-right">
                    <IndianCurrency
                      amount={Number(bill.totalAmount)}
                      className="font-medium"
                    />
                  </TableCell>
                  <TableCell className="capitalize">
                    {bill.paymentMode.toLowerCase()}
                  </TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {formatDateTime(bill.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Row 4 — quick actions */}
      <div className="flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/bills/new">
            <Plus className="h-4 w-4" />
            New Sale Bill
          </Link>
        </Button>
        <Button asChild variant="navy" size="lg">
          <Link href="/customers/new">
            <UserPlus className="h-4 w-4" />
            Add Customer
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/rates">
            <Coins className="h-4 w-4" />
            Enter Gold Rate
          </Link>
        </Button>
      </div>
    </div>
  );
}
