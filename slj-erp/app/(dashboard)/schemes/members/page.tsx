import Link from "next/link";
import { getChitMembers } from "@/lib/actions/chitMembers";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function MembersPage() {
  const members = await getChitMembers();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <Link href="/schemes" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>
          <h2 className="text-xl font-semibold mt-1">All Members</h2>
        </div>
        <Link href="/schemes/members/new">
          <Button>Enrol Member</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Scheme</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Enrolled</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((m) => (
            <TableRow key={m.id}>
              <TableCell className="font-mono text-xs">{m.memberId}</TableCell>
              <TableCell>{m.customer.name}</TableCell>
              <TableCell>{m.scheme.schemeName}</TableCell>
              <TableCell>{m.payments.length}/{m.scheme.durationMonths}</TableCell>
              <TableCell>{formatDateDDMMYYYY(m.enrolmentDate)}</TableCell>
              <TableCell><Badge variant="secondary">{m.status}</Badge></TableCell>
              <TableCell>
                <Link href={`/schemes/members/${m.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No members enrolled
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
