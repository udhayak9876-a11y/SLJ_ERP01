import Link from "next/link";
import { format } from "date-fns";
import { getDashboardStats, getRecentBills } from "@/lib/actions/bills";
import { getTodayRate } from "@/lib/actions/rates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

export default async function DashboardPage() {
  const [stats, recentBills, todayRate] = await Promise.all([
    getDashboardStats(),
    getRecentBills(10),
    getTodayRate(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
              Cash Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              <IndianCurrency amount={stats.cashCollected} />
            </p>
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

      <div className="flex flex-wrap gap-3">
        <Link href="/bills/new">
          <Button>+ New Sale Bill</Button>
        </Link>
        <Link href="/customers/new">
          <Button variant="outline">+ Add Customer</Button>
        </Link>
        <Link href="/rates">
          <Button variant="outline">Enter Gold Rate</Button>
        </Link>
      </div>
    </div>
  );
}
