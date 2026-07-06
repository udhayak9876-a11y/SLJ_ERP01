"use client";

import { useMemo, useState } from "react";
import { CustomerType } from "@prisma/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { IndianCurrency } from "@/components/shared/IndianCurrency";

export interface CustomerRow {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  city: string;
  customerType: CustomerType;
  balance: number;
  isActive: boolean;
}

const TYPE_BADGE: Record<CustomerType, "gold" | "secondary" | "success"> = {
  RETAIL: "secondary",
  WHOLESALE: "success",
  VIP: "gold",
};

export function CustomersTable({ customers }: { customers: CustomerRow[] }) {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (type !== "ALL" && c.customerType !== type) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.phone.includes(q);
    });
  }, [customers, search, type]);

  return (
    <div>
      <div className="mb-3 flex gap-3">
        <Input
          placeholder="Search by name or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Types</SelectItem>
            <SelectItem value="RETAIL">Retail</SelectItem>
            <SelectItem value="WHOLESALE">Wholesale</SelectItem>
            <SelectItem value="VIP">VIP</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-6 text-center text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono font-medium">{c.customerCode}</TableCell>
                <TableCell>{c.name}</TableCell>
                <TableCell className="tabular-nums">{c.phone}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>
                  <Badge variant={TYPE_BADGE[c.customerType]}>
                    {c.customerType}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <IndianCurrency
                    amount={c.balance}
                    className={c.balance > 0 ? "font-semibold text-red-600" : ""}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={c.isActive ? "success" : "gray"}>
                    {c.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
