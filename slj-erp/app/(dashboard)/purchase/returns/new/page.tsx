import Link from "next/link";
import { getConfirmedPurchaseBillsForReturn } from "@/lib/actions/purchases";
import { PurchaseReturnForm } from "@/components/purchase/PurchaseReturnForm";

export default async function NewPurchaseReturnPage({
  searchParams,
}: {
  searchParams: { billId?: string };
}) {
  const bills = await getConfirmedPurchaseBillsForReturn();

  return (
    <div>
      <Link href="/purchase/returns" className="text-sm text-muted-foreground hover:underline">← Returns</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Purchase Return to Dealer</h2>
      <PurchaseReturnForm bills={bills} defaultBillId={searchParams.billId} />
    </div>
  );
}
