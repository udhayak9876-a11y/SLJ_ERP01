import Link from "next/link";
import { getPurchaseBills } from "@/lib/actions/purchases";
import { PurchaseBillsTable } from "@/components/purchase/PurchaseBillsTable";

export default async function PurchaseBillsPage() {
  const bills = await getPurchaseBills();
  return (
    <div>
      <Link href="/purchase" className="text-sm text-muted-foreground hover:underline">← Purchase</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Purchase Bills</h2>
      <PurchaseBillsTable bills={bills} />
    </div>
  );
}
