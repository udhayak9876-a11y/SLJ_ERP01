"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Category, MakingType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/components/ui/use-toast";
import { toggleItemActive } from "@/lib/actions/items";
import { formatINR } from "@/lib/utils/currency";

export interface ItemRow {
  id: string;
  itemCode: string;
  itemName: string;
  category: Category;
  karat: string | null;
  makingChargeType: MakingType;
  makingChargeValue: number;
  isActive: boolean;
}

const MAKING_LABEL: Record<MakingType, (v: number) => string> = {
  PER_GRAM: (v) => `${formatINR(v, 2)}/g`,
  PERCENTAGE: (v) => `${v}%`,
  FIXED: (v) => `${formatINR(v, 2)} fixed`,
};

export function ItemsTable({ items }: { items: ItemRow[] }) {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("ALL");
  const [pending, setPending] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== "ALL" && item.category !== category) return false;
      if (!q) return true;
      return (
        item.itemName.toLowerCase().includes(q) ||
        item.itemCode.toLowerCase().includes(q)
      );
    });
  }, [items, search, category]);

  async function handleToggle(item: ItemRow) {
    setPending(item.id);
    try {
      await toggleItemActive(item.id, !item.isActive);
      toast({
        title: `${item.itemCode} marked ${item.isActive ? "inactive" : "active"}`,
        variant: "success",
      });
    } catch {
      toast({ title: "Failed to update item", variant: "destructive" });
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex gap-3">
        <Input
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Categories</SelectItem>
            <SelectItem value="GOLD">Gold</SelectItem>
            <SelectItem value="SILVER">Silver</SelectItem>
            <SelectItem value="DIAMOND">Diamond</SelectItem>
            <SelectItem value="STONE">Stone</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Karat</TableHead>
              <TableHead>Making Charge</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono font-medium">{item.itemCode}</TableCell>
                <TableCell>{item.itemName}</TableCell>
                <TableCell>
                  <Badge variant="gold">{item.category}</Badge>
                </TableCell>
                <TableCell>{item.karat ?? "—"}</TableCell>
                <TableCell className="tabular-nums">
                  {MAKING_LABEL[item.makingChargeType](item.makingChargeValue)}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => handleToggle(item)}
                    disabled={pending === item.id}
                    title="Click to toggle"
                  >
                    <Badge variant={item.isActive ? "success" : "gray"}>
                      {item.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </button>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/items/${item.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
