import Link from "next/link";
import { getActiveSuppliers } from "@/lib/actions/suppliers";
import { getActiveItems } from "@/lib/actions/items";
import { PurchaseBillForm } from "@/components/purchase/PurchaseBillForm";

export default async function NewPurchaseBillPage() {
  const [suppliers, products] = await Promise.all([
    getActiveSuppliers(),
    getActiveItems(),
  ]);

  return (
    <div>
      <Link href="/purchase/bills" className="text-sm text-muted-foreground hover:underline">← Bills</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">New Purchase from Supplier</h2>
      <PurchaseBillForm suppliers={suppliers} products={products} />
    </div>
  );
}
