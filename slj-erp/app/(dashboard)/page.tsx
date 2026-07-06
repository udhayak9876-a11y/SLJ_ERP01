import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils/currency";
import { formatDisplayDate } from "@/lib/utils/date";

export default async function DashboardPage() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const [todayBills, drafts, outstandingAgg, todayRates, recentBills] = await Promise.all([
    prisma.salesBill.findMany({ where: { billDate: { gte: start, lt: end }, status: "CONFIRMED" } }),
    prisma.salesBill.count({ where: { status: "DRAFT" } }),
    prisma.salesBill.aggregate({ _sum: { balanceDue: true }, where: { status: "CONFIRMED" } }),
    prisma.dailyRate.findFirst({ where: { date: start } }),
    prisma.salesBill.findMany({
      where: { status: "CONFIRMED" },
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const todaySalesTotal = todayBills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);
  const cashCollected = todayBills
    .filter((b) => b.paymentMode === "CASH")
    .reduce((sum, bill) => sum + Number(bill.amountPaid), 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <Stat title="Today’s Sales" value={`${todayBills.length} | ${formatINR(todaySalesTotal)}`} />
        <Stat title="Cash Collected" value={formatINR(cashCollected)} />
        <Stat title="Pending Drafts" value={String(drafts)} />
        <Stat title="Outstanding" value={formatINR(Number(outstandingAgg._sum.balanceDue || 0))} />
      </div>

      <div className="rounded-md border p-3">
        <h2 className="mb-2 text-sm font-semibold">Gold Rate</h2>
        {todayRates ? (
          <p className="text-sm">
            22K: {formatINR(Number(todayRates.gold22kRate))}/g | 18K: {formatINR(Number(todayRates.gold18kRate))}/g |
            Silver: {formatINR(Number(todayRates.silverRate))}/g
          </p>
        ) : (
          <div className="flex items-center justify-between rounded-md bg-red-50 p-3 text-red-700">
            <span>⚠ Today’s gold rate not entered</span>
            <Link href="/rates" className="font-medium underline">Enter Now →</Link>
          </div>
        )}
      </div>

      <div className="rounded-md border p-3">
        <h2 className="mb-2 text-sm font-semibold">Recent Bills</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="px-2 py-2">Bill No</th><th className="px-2 py-2">Customer</th><th className="px-2 py-2">Total</th><th className="px-2 py-2">Payment</th><th className="px-2 py-2">Time</th>
            </tr>
          </thead>
          <tbody>
            {recentBills.map((bill) => (
              <tr key={bill.id}>
                <td className="border-b px-2 py-2"><Link className="text-blue-700 underline" href={`/bills/${bill.id}/print`}>{bill.billNumber}</Link></td>
                <td className="border-b px-2 py-2">{bill.customer?.name || bill.walkInName || "Walk-in"}</td>
                <td className="border-b px-2 py-2">{formatINR(Number(bill.totalAmount))}</td>
                <td className="border-b px-2 py-2">{bill.paymentMode}</td>
                <td className="border-b px-2 py-2">{formatDisplayDate(bill.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Link href="/bills/new" className="rounded-md bg-[#d4a017] px-3 py-2 text-sm font-semibold text-black">+ New Sale Bill</Link>
        <Link href="/customers/new" className="rounded-md border px-3 py-2 text-sm">+ Add Customer</Link>
        <Link href="/rates" className="rounded-md border px-3 py-2 text-sm">Enter Gold Rate</Link>
      </div>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border p-3">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
