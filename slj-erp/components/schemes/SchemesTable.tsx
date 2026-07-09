"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ChitScheme } from "@prisma/client";
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
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { closeChitScheme } from "@/lib/actions/chitSchemes";
import { toast } from "sonner";

type SchemeRow = ChitScheme & { _count: { members: number } };

interface SchemesTableProps {
  schemes: SchemeRow[];
}

export function SchemesTable({ schemes }: SchemesTableProps) {
  const sorted = useMemo(
    () => [...schemes].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
    [schemes]
  );

  async function handleClose(id: string) {
    if (!confirm("Close this scheme? No new enrolments allowed.")) return;
    try {
      await closeChitScheme(id);
      toast.success("Scheme closed");
      window.location.reload();
    } catch {
      toast.error("Failed");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/schemes/new">
          <Button>New Scheme</Button>
        </Link>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Instalment</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Start</TableHead>
            <TableHead>Maturity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((s) => (
            <TableRow key={s.id}>
              <TableCell className="font-mono text-xs">{s.schemeCode}</TableCell>
              <TableCell>{s.schemeName}</TableCell>
              <TableCell>{s.durationMonths} mo</TableCell>
              <TableCell><IndianCurrency amount={Number(s.instalmentAmount)} /></TableCell>
              <TableCell>{s._count.members}</TableCell>
              <TableCell>{formatDateDDMMYYYY(s.startDate)}</TableCell>
              <TableCell>{formatDateDDMMYYYY(s.maturityDate)}</TableCell>
              <TableCell><Badge>{s.status}</Badge></TableCell>
              <TableCell className="space-x-1">
                <Link href={`/schemes/${s.id}`}>
                  <Button variant="ghost" size="sm">View</Button>
                </Link>
                {s.status === "ACTIVE" && (
                  <Button variant="ghost" size="sm" onClick={() => handleClose(s.id)}>Close</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No schemes yet — create your first gold saving scheme
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
