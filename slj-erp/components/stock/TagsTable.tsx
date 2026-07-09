"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Tag, Item, Counter, Lot, TagStatus } from "@prisma/client";
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
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { Pagination, paginate, PAGE_SIZE } from "@/components/shared/Pagination";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

type TagWithRelations = Tag & {
  product: Item;
  counter: Counter | null;
  lot: Lot | null;
};

interface TagsTableProps {
  tags: TagWithRelations[];
  counters: Counter[];
}

const STATUS_COLORS: Record<TagStatus, "default" | "secondary" | "destructive"> = {
  RECEIVED: "secondary",
  COUNTER_ASSIGNED: "default",
  SOLD: "destructive",
  RETURNED: "secondary",
  WITH_KARIGAR: "secondary",
};

export function TagsTable({ tags, counters }: TagsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [counterFilter, setCounterFilter] = useState("ALL");
  const [missingHuidOnly, setMissingHuidOnly] = useState(false);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return tags.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.tagId.toLowerCase().includes(q) ||
        t.product.itemName.toLowerCase().includes(q) ||
        (t.huidNumber?.toLowerCase().includes(q) ?? false);
      const matchesStatus =
        statusFilter === "ALL" || t.status === statusFilter;
      const matchesCounter =
        counterFilter === "ALL" || t.counterId === counterFilter;
      const matchesHuid =
        !missingHuidOnly ||
        (t.product.category === "GOLD" && !t.huidNumber);
      return matchesSearch && matchesStatus && matchesCounter && matchesHuid;
    });
  }, [tags, search, statusFilter, counterFilter, missingHuidOnly]);

  const { items, totalPages, page: safePage } = paginate(filtered, page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search tag ID, product, HUID..."
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
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
            <SelectItem value="COUNTER_ASSIGNED">At Counter</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
            <SelectItem value="RETURNED">Returned</SelectItem>
            <SelectItem value="WITH_KARIGAR">With Karigar</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={counterFilter}
          onValueChange={(v) => {
            setCounterFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Counter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Counters</SelectItem>
            {counters.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.counterName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={missingHuidOnly}
            onChange={(e) => {
              setMissingHuidOnly(e.target.checked);
              setPage(1);
            }}
          />
          Missing HUID (Gold)
        </label>
        <div className="flex-1" />
        <Link href="/stock/tags/new">
          <Button>New Tag</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tag ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Net Wt</TableHead>
            <TableHead>HUID</TableHead>
            <TableHead>Counter</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Value</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((t) => (
            <TableRow key={t.id}>
              <TableCell className="font-mono text-xs">{t.tagId}</TableCell>
              <TableCell>{t.product.itemName}</TableCell>
              <TableCell>
                <WeightDisplay weight={Number(t.netWeight)} />
              </TableCell>
              <TableCell>
                {t.huidNumber ? (
                  <span className="font-mono text-xs">{t.huidNumber}</span>
                ) : t.product.category === "GOLD" ? (
                  <span className="text-red-500 text-xs">Missing</span>
                ) : (
                  "—"
                )}
              </TableCell>
              <TableCell>{t.counter?.counterName ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={STATUS_COLORS[t.status]}>{t.status}</Badge>
              </TableCell>
              <TableCell>{formatDateDDMMYYYY(t.receivedDate)}</TableCell>
              <TableCell>
                <IndianCurrency
                  amount={
                    Number(t.netWeight) *
                    Number(t.purchaseRate ?? t.mrp ?? 0)
                  }
                />
              </TableCell>
              <TableCell>
                <Link href={`/stock/tags/${t.id}`}>
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
                {tags.length === 0 ? (
                  <div>
                    <p>No tags yet.</p>
                    <Link href="/stock/tags/new">
                      <Button className="mt-2" size="sm">
                        Create first tag
                      </Button>
                    </Link>
                  </div>
                ) : (
                  "No tags match your filters"
                )}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
      <p className="text-xs text-muted-foreground">
        Showing {items.length} of {filtered.length} tags ({PAGE_SIZE} per page)
      </p>
    </div>
  );
}
