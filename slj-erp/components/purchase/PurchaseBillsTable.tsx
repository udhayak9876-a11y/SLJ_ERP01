"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { PurchaseBill, Supplier } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { Pagination, paginate } from "@/components/shared/Pagination";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

type PurchaseBillRow = PurchaseBill & {
  supplier: Supplier;
  _count: { items: number };
};

interface PurchaseBillsTableProps {
  bills: PurchaseBillRow[];
}

export function PurchaseBillsTable({ bills }: PurchaseBillsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (b.billNumber?.toLowerCase().includes(q) ?? false) ||
        b.supplier.companyName.toLowerCase().includes(q) ||
        (b.invoiceNumber?.toLowerCase().includes(q) ?? false);
      const matchesStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bills, search, statusFilter]);

  const { items, totalPages, page: safePage } = paginate(filtered, page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search bill no, supplier, invoice..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Link href="/purchase/bills/new">
          <Button>New Purchase</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill No.</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((b) => (
            <TableRow key={b.id}>
              <TableCell className="font-mono text-xs">
                {b.billNumber ?? "Draft"}
              </TableCell>
              <TableCell>{formatDateDDMMYYYY(b.billDate)}</TableCell>
              <TableCell>{b.supplier.companyName}</TableCell>
              <TableCell>{b.invoiceNumber ?? "—"}</TableCell>
              <TableCell>{b._count.items}</TableCell>
              <TableCell>
                <WeightDisplay weight={Number(b.totalWeight)} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={Number(b.totalAmount)} />
              </TableCell>
              <TableCell>
                <Badge variant={b.status === "CONFIRMED" ? "default" : "secondary"}>
                  {b.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Link href={`/purchase/bills/${b.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                No purchase bills found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
