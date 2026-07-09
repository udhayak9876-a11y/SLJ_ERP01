"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Lot, Supplier } from "@prisma/client";
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
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { closeLot } from "@/lib/actions/lots";
import { toast } from "sonner";

type LotRow = Lot & {
  supplier: Supplier | null;
  _count: { tags: number };
};

interface LotsTableProps {
  lots: LotRow[];
}

export function LotsTable({ lots }: LotsTableProps) {
  const sorted = useMemo(
    () => [...lots].sort((a, b) => new Date(b.lotDate).getTime() - new Date(a.lotDate).getTime()),
    [lots]
  );

  async function handleClose(id: string) {
    try {
      await closeLot(id);
      toast.success("Lot closed");
      window.location.reload();
    } catch {
      toast.error("Failed to close lot");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link href="/stock/lots/new">
          <Button>New Lot</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lot No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Metal</TableHead>
            <TableHead>Pieces</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((lot) => (
            <TableRow key={lot.id}>
              <TableCell className="font-mono text-xs">{lot.lotNumber}</TableCell>
              <TableCell>{formatDateDDMMYYYY(lot.lotDate)}</TableCell>
              <TableCell>{lot.supplier?.companyName ?? "—"}</TableCell>
              <TableCell>
                <Badge variant="secondary">{lot.metalType}</Badge>
              </TableCell>
              <TableCell>{lot._count.tags}</TableCell>
              <TableCell>
                <WeightDisplay weight={Number(lot.totalWeight)} />
              </TableCell>
              <TableCell>{lot.status}</TableCell>
              <TableCell className="space-x-1">
                <Link href={`/stock/lots/${lot.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
                {lot.status === "OPEN" && (
                  <Button variant="ghost" size="sm" onClick={() => handleClose(lot.id)}>
                    Close
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                <p>No lots yet.</p>
                <Link href="/stock/lots/new">
                  <Button className="mt-2" size="sm">
                    Create first lot
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
