import { notFound } from "next/navigation";
import { getBill } from "@/lib/actions/bills";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function BillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const bill = await getBill(params.id);
  if (!bill) notFound();

  const customerName =
    bill.customer?.name ?? bill.walkInName ?? "Walk-in";

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Bill {bill.billNumber || "Draft"}
        </h2>
        <div className="flex gap-2">
          <Badge
            variant={
              bill.status === "CONFIRMED"
                ? "confirmed"
                : bill.status === "CANCELLED"
                  ? "cancelled"
                  : "draft"
            }
          >
            {bill.status}
          </Badge>
          <Link href={`/bills/${bill.id}/print`}>
            <Button size="sm">Print</Button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
        <div>
          <p className="text-muted-foreground">Date</p>
          <p>{formatDateDDMMYYYY(bill.billDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Customer</p>
          <p>{customerName}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <IndianCurrency amount={Number(bill.totalAmount)} />
        </div>
        <div>
          <p className="text-muted-foreground">Payment</p>
          <p>{bill.paymentMode}</p>
        </div>
      </div>
    </div>
  );
}
