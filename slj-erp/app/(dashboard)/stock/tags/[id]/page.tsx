import Link from "next/link";
import { notFound } from "next/navigation";
import { getTag } from "@/lib/actions/tags";
import { getActiveCounters } from "@/lib/actions/counters";
import { TagDetailView } from "@/components/stock/TagDetailView";

export default async function TagDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [tag, counters] = await Promise.all([
    getTag(params.id),
    getActiveCounters(),
  ]);

  if (!tag) notFound();

  return (
    <div>
      <Link href="/stock/tags" className="text-sm text-muted-foreground hover:underline">
        ← Tags
      </Link>
      <div className="mt-2">
        <TagDetailView tag={tag} counters={counters} />
      </div>
    </div>
  );
}
