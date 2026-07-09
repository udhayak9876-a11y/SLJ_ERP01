import Link from "next/link";
import { getSuppliers } from "@/lib/actions/suppliers";
import { SuppliersTable } from "@/components/purchase/SuppliersTable";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();
  return (
    <div>
      <Link href="/purchase" className="text-sm text-muted-foreground hover:underline">← Purchase</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Supplier / Dealer Master</h2>
      <SuppliersTable suppliers={suppliers} />
    </div>
  );
}
