"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { OldMetalPurchase, Customer } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { Pagination, paginate } from "@/components/shared/Pagination";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

type OldMetalRow = OldMetalPurchase & { customer: Customer | null };

interface OldMetalTableProps {
  records: OldMetalRow[];
}

export function OldMetalTable({ records }: OldMetalTableProps) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        !q ||
        (r.voucherNumber?.toLowerCase().includes(q) ?? false) ||
        (r.customerName?.toLowerCase().includes(q) ?? false) ||
        (r.customer?.name.toLowerCase().includes(q) ?? false)
    );
  }, [records, search]);

  const { items, totalPages, page: safePage } = paginate(filtered, page);

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Input
          placeholder="Search voucher, customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <div className="flex-1" />
        <Link href="/purchase/old-metal/new">
          <Button>New Buyback</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Voucher</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Metal</TableHead>
            <TableHead>Weight</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Payment</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-mono text-xs">{r.voucherNumber}</TableCell>
              <TableCell>{formatDateDDMMYYYY(r.voucherDate)}</TableCell>
              <TableCell>{r.customer?.name ?? r.customerName ?? "Walk-in"}</TableCell>
              <TableCell>{r.metalType} {r.karat && `(${r.karat})`}</TableCell>
              <TableCell>
                <WeightDisplay weight={Number(r.netWeight)} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={Number(r.totalAmount)} />
              </TableCell>
              <TableCell>{r.paymentMode}</TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No old metal purchases recorded
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
