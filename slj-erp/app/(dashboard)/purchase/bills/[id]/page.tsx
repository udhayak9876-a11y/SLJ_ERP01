import Link from "next/link";
import { notFound } from "next/navigation";
import { getPurchaseBill } from "@/lib/actions/purchases";
import { PurchaseBillDetail } from "@/components/purchase/PurchaseBillDetail";

export default async function PurchaseBillDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const bill = await getPurchaseBill(params.id);
  if (!bill) notFound();

  return (
    <div>
      <Link href="/purchase/bills" className="text-sm text-muted-foreground hover:underline">← Bills</Link>
      <div className="mt-2">
        <PurchaseBillDetail bill={bill} />
      </div>
    </div>
  );
}
