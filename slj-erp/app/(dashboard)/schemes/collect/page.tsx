import Link from "next/link";
import { getChitMembers } from "@/lib/actions/chitMembers";
import { CollectInstalmentForm } from "@/components/schemes/CollectInstalmentForm";

export default async function CollectPage({
  searchParams,
}: {
  searchParams: { memberId?: string };
}) {
  const allMembers = await getChitMembers();
  const activeMembers = allMembers.filter((m) => m.status === "ACTIVE");

  return (
    <div>
      <Link href="/schemes" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Collect Instalment</h2>
      <CollectInstalmentForm
        members={activeMembers}
        defaultMemberId={searchParams.memberId}
      />
    </div>
  );
}
