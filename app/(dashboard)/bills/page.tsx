import { prisma } from "@/lib/prisma";
import { todayDateOnly } from "@/lib/utils/date";
import { BillsTable } from "@/components/bills/BillsTable";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

export const dynamic = "force-dynamic";

export default async function BillsPage() {
  const today = todayDateOnly();

  const [bills, todayConfirmed] = await Promise.all([
    prisma.salesBill.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: { select: { name: true, customerCode: true } },
        _count: { select: { items: true } },
      },
      take: 500,
    }),
    prisma.salesBill.findMany({
      where: { billDate: today, status: "CONFIRMED" },
      select: { totalAmount: true, amountPaid: true, paymentMode: true },
    }),
  ]);

  const todayTotal = todayConfirmed.reduce(
    (sum, b) => sum + Number(b.totalAmount),
    0
  );
  const todayCash = todayConfirmed
    .filter((b) => b.paymentMode === "CASH")
    .reduce((sum, b) => sum + Number(b.amountPaid), 0);

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold text-navy">Bills List</h1>

      <div className="mb-4 flex gap-6 rounded-md border bg-gold-light/30 px-4 py-3 text-sm">
        <div>
          <span className="text-muted-foreground">Today&apos;s Sales: </span>
          <IndianCurrency amount={todayTotal} className="font-bold text-navy" />
        </div>
        <div>
          <span className="text-muted-foreground">Bills Today: </span>
          <span className="font-bold text-navy">{todayConfirmed.length}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Cash Collected: </span>
          <IndianCurrency amount={todayCash} className="font-bold text-navy" />
        </div>
      </div>

      <BillsTable
        bills={bills.map((b) => ({
          id: b.id,
          billNumber: b.status === "DRAFT" ? "—" : b.billNumber,
          billDate: b.billDate.toISOString(),
          customerName: b.customer?.name ?? b.walkInName ?? "Walk-in",
          itemCount: b._count.items,
          totalAmount: Number(b.totalAmount),
          amountPaid: Number(b.amountPaid),
          balanceDue: Number(b.balanceDue),
          paymentMode: b.paymentMode,
          status: b.status,
        }))}
      />
    </div>
  );
}
