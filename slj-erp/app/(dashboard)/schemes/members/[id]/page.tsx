import Link from "next/link";
import { notFound } from "next/navigation";
import { getMemberInstalmentStatus } from "@/lib/actions/chitMembers";
import { MemberDetailView } from "@/components/schemes/MemberDetailView";

export default async function MemberDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let status;
  try {
    status = await getMemberInstalmentStatus(params.id);
  } catch {
    notFound();
  }

  return (
    <div>
      <Link href="/schemes/members" className="text-sm text-muted-foreground hover:underline">← Members</Link>
      <div className="mt-2">
        <MemberDetailView
          member={status.member}
          instalments={status.instalments}
          paidCount={status.paidCount}
          remaining={status.remaining}
          totalPaid={status.totalPaid}
          isMature={status.isMature}
        />
      </div>
    </div>
  );
}
