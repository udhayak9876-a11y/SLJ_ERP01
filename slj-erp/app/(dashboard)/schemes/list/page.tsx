import Link from "next/link";
import { getChitSchemes } from "@/lib/actions/chitSchemes";
import { SchemesTable } from "@/components/schemes/SchemesTable";

export default async function SchemesListPage() {
  const schemes = await getChitSchemes();
  return (
    <div>
      <Link href="/schemes" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>
      <h2 className="text-xl font-semibold mt-1 mb-4">Scheme Master</h2>
      <SchemesTable schemes={schemes} />
    </div>
  );
}
