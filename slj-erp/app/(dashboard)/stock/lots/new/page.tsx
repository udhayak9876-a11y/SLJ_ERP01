import Link from "next/link";
import { getActiveSuppliers } from "@/lib/actions/suppliers";
import { LotForm } from "@/components/stock/LotForm";

export default async function NewLotPage() {
  const suppliers = await getActiveSuppliers();

  return (
    <div>
      <Link href="/stock/lots" className="text-sm text-muted-foreground hover:underline">
        ← Lots
      </Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">New Lot</h2>
      <LotForm suppliers={suppliers} />
    </div>
  );
}
