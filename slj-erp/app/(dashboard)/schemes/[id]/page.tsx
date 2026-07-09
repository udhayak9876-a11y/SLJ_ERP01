import Link from "next/link";
import { notFound } from "next/navigation";
import { getChitScheme } from "@/lib/actions/chitSchemes";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function SchemeDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const scheme = await getChitScheme(params.id);
  if (!scheme) notFound();

  return (
    <div className="space-y-6">
      <Link href="/schemes/list" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold">{scheme.schemeName}</h2>
          <p className="font-mono text-sm text-muted-foreground">{scheme.schemeCode}</p>
        </div>
        <Badge>{scheme.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Duration</p>
          <p className="font-semibold">{scheme.durationMonths} months</p>
        </div>
        <div>
          <p className="text-muted-foreground">Instalment</p>
          <IndianCurrency amount={Number(scheme.instalmentAmount)} className="font-semibold" />
        </div>
        <div>
          <p className="text-muted-foreground">Start</p>
          <p>{formatDateDDMMYYYY(scheme.startDate)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Maturity</p>
          <p>{formatDateDDMMYYYY(scheme.maturityDate)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link href={`/schemes/members/new?schemeId=${scheme.id}`}>
          <Button>+ Enrol Member</Button>
        </Link>
      </div>

      <div>
        <h3 className="font-medium mb-2">Members ({scheme.members.length})</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheme.members.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-mono text-xs">{m.memberId}</TableCell>
                <TableCell>{m.customer.name}</TableCell>
                <TableCell>{m.payments.length} / {scheme.durationMonths}</TableCell>
                <TableCell>{m.status}</TableCell>
                <TableCell>
                  <Link href={`/schemes/members/${m.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {scheme.members.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  No members enrolled yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
