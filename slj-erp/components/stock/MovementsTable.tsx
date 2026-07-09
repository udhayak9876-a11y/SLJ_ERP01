"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { StockMovement, Tag, Item } from "@prisma/client";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import { Pagination, paginate } from "@/components/shared/Pagination";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

type MovementRow = StockMovement & {
  tag: Tag & { product: Item };
};

interface MovementsTableProps {
  movements: MovementRow[];
}

export function MovementsTable({ movements }: MovementsTableProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return movements.filter((m) => {
      const matchesSearch =
        !search || m.tag.tagId.toLowerCase().includes(search.toLowerCase());
      const matchesType = typeFilter === "ALL" || m.movementType === typeFilter;
      return matchesSearch && matchesType;
    });
  }, [movements, search, typeFilter]);

  const { items, totalPages, page: safePage } = paginate(filtered, page);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search tag ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="max-w-xs"
        />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="PURCHASE_IN">Purchase In</SelectItem>
            <SelectItem value="SALE_OUT">Sale Out</SelectItem>
            <SelectItem value="RETURN_IN">Return In</SelectItem>
            <SelectItem value="KARIGAR_OUT">Karigar Out</SelectItem>
            <SelectItem value="KARIGAR_IN">Karigar In</SelectItem>
            <SelectItem value="COUNTER_TRANSFER">Counter Transfer</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Tag ID</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Weight</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((m) => (
            <TableRow key={m.id}>
              <TableCell>{formatDateDDMMYYYY(m.date)}</TableCell>
              <TableCell>
                <Link
                  href={`/stock/tags/${m.tag.id}`}
                  className="font-mono text-xs text-gold hover:underline"
                >
                  {m.tag.tagId}
                </Link>
              </TableCell>
              <TableCell>{m.tag.product.itemName}</TableCell>
              <TableCell className="text-xs">{m.movementType}</TableCell>
              <TableCell>{m.fromLocation ?? "—"}</TableCell>
              <TableCell>{m.toLocation ?? "—"}</TableCell>
              <TableCell>
                <WeightDisplay weight={Number(m.weight)} />
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                No stock movements recorded yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
