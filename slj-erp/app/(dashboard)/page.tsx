import Link from "next/link";
import { format } from "date-fns";
import { toISODate } from "@/lib/utils/date";
import { getDashboardStats, getRecentBills } from "@/lib/actions/bills";
import { getTodayRate } from "@/lib/actions/rates";
import { getChitReminders } from "@/lib/actions/chitMembers";
import { EMPTY_DASHBOARD_STATS } from "@/lib/db/defaults";
import { safeDbCall } from "@/lib/db/safe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChitRemindersWidget } from "@/components/schemes/ChitRemindersWidget";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { formatINR } from "@/lib/utils/currency";
import type { SalesBill, Customer } from "@prisma/client";

type RecentBill = SalesBill & { customer: Customer | null };

export default async function DashboardPage() {
  const [statsResult, recentBillsResult, todayRateResult, remindersResult] =
    await Promise.all([
    safeDbCall(
      "dashboard.getDashboardStats",
      () => getDashboardStats(),
      EMPTY_DASHBOARD_STATS
    ),
    safeDbCall("dashboard.getRecentBills", () => getRecentBills(10), [] as RecentBill[]),
    safeDbCall("dashboard.getTodayRate", () => getTodayRate(), null),
    safeDbCall("dashboard.getChitReminders", () => getChitReminders(7), []),
  ]);

  const stats = statsResult.data ?? EMPTY_DASHBOARD_STATS;
  const recentBills = recentBillsResult.data ?? [];
  const todayRate = todayRateResult.data;
  const chitReminders = remindersResult.data ?? [];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today&apos;s Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <IndianCurrency amount={stats.todaySalesTotal} />
            </p>
            <p className="text-xs text-muted-foreground">
              {stats.todaySalesCount} bills
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Collected Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <IndianCurrency amount={stats.totalCollected ?? 0} />
            </p>
            <p className="text-xs text-muted-foreground">
              Sales + chit · Cash {formatINR(stats.cashCollected ?? 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chit Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <IndianCurrency amount={stats.chitCollected ?? 0} />
            </p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingDrafts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <IndianCurrency amount={stats.outstanding} />
            </p>
          </CardContent>
        </Card>
      </div>

      {todayRate ? (
        <Card>
          <CardContent className="flex flex-wrap items-center gap-6 p-4">
            <span className="font-semibold">Gold Rates Today:</span>
            <span>
              22K: <IndianCurrency amount={Number(todayRate.gold22kRate)} />
              /g
            </span>
            <span>
              18K: <IndianCurrency amount={Number(todayRate.gold18kRate)} />
              /g
            </span>
            <span>
              Silver: <IndianCurrency amount={Number(todayRate.silverRate)} />
              /g
            </span>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="flex items-center justify-between p-4">
            <p className="font-semibold text-red-700">
              ⚠ Today&apos;s gold rate not entered
            </p>
            <Link href="/rates">
              <Button size="sm">Enter Now →</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Bills</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill No</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <Link
                        href={`/bills/${bill.id}/print`}
                        className="font-mono text-xs text-gold hover:underline"
                      >
                        {bill.billNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {bill.customer?.name ?? bill.walkInName ?? "Walk-in"}
                    </TableCell>
                    <TableCell>
                      <IndianCurrency amount={Number(bill.totalAmount)} />
                    </TableCell>
                    <TableCell>{bill.paymentMode}</TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(bill.createdAt), "HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
                {recentBills.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground"
                    >
                      No confirmed bills yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className={chitReminders.some((r) => r.daysUntilDue < 0) ? "border-red-300" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Chit Reminders</CardTitle>
            <Link href="/schemes/reminders">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <ChitRemindersWidget reminders={chitReminders} compact />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/bills/new">
          <Button>+ New Sale Bill</Button>
        </Link>
        <Link href={`/reports/daily-sales?date=${toISODate(new Date())}`}>
          <Button variant="outline">Daily Summary</Button>
        </Link>
        <Link href="/schemes/collect">
          <Button variant="outline">Collect Chit</Button>
        </Link>
        <Link href="/customers/new">
          <Button variant="outline">+ Add Customer</Button>
        </Link>
        <Link href="/rates">
          <Button variant="outline">Enter Gold Rate</Button>
        </Link>
        <Link href="/reports">
          <Button variant="outline">Reports</Button>
        </Link>
      </div>
    </div>
  );
}
