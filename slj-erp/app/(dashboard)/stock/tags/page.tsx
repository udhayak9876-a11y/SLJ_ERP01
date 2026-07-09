import Link from "next/link";
import { getTags } from "@/lib/actions/tags";
import { getCounters } from "@/lib/actions/counters";
import { TagsTable } from "@/components/stock/TagsTable";

export default async function TagsPage() {
  const [tags, counters] = await Promise.all([getTags(), getCounters()]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tag Management</h2>
          <p className="text-sm text-muted-foreground">
            Every physical piece has a unique tag barcode
          </p>
        </div>
        <Link href="/stock" className="text-sm text-muted-foreground hover:underline">
          ← Stock
        </Link>
      </div>
      <TagsTable tags={tags} counters={counters} />
    </div>
  );
}
