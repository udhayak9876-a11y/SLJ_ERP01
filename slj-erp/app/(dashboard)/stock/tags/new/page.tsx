import Link from "next/link";
import { getActiveItems } from "@/lib/actions/items";
import { getActiveCounters } from "@/lib/actions/counters";
import { getOpenLots } from "@/lib/actions/lots";
import { TagForm } from "@/components/stock/TagForm";

export default async function NewTagPage({
  searchParams,
}: {
  searchParams: { lotId?: string };
}) {
  const [products, counters, lots] = await Promise.all([
    getActiveItems(),
    getActiveCounters(),
    getOpenLots(),
  ]);

  return (
    <div>
      <div className="mb-4">
        <Link href="/stock/tags" className="text-sm text-muted-foreground hover:underline">
          ← Tags
        </Link>
        <h2 className="text-xl font-semibold mt-1">New Tag</h2>
      </div>
      <TagForm
        products={products}
        counters={counters}
        lots={lots}
        defaultLotId={searchParams.lotId}
      />
    </div>
  );
}
