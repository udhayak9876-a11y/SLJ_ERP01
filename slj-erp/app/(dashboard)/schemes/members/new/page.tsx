import Link from "next/link";
import { getActiveChitSchemes } from "@/lib/actions/chitSchemes";
import { getCustomers } from "@/lib/actions/customers";
import { MemberEnrolForm } from "@/components/schemes/MemberEnrolForm";

export default async function EnrolMemberPage({
  searchParams,
}: {
  searchParams: { schemeId?: string };
}) {
  const [schemes, customers] = await Promise.all([
    getActiveChitSchemes(),
    getCustomers(),
  ]);

  return (
    <div>
      <Link href="/schemes/members" className="text-sm text-muted-foreground hover:underline">← Members</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Enrol Member</h2>
      <MemberEnrolForm
        schemes={schemes}
        customers={customers}
        defaultSchemeId={searchParams.schemeId}
      />
    </div>
  );
}
