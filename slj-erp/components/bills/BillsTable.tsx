"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Customer,
  PaymentMode,
  SalesBill,
  SalesBillItem,
  BillStatus,
} from "@prisma/client";
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
import { cancelBill } from "@/lib/actions/bills";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { toast } from "sonner";

type BillWithRelations = SalesBill & {
  customer: Customer | null;
  items: SalesBillItem[];
};

interface BillsTableProps {
  bills: BillWithRelations[];
  summary: { count: number; totalSales: number; cashCollected: number };
}

export function BillsTable({ bills, summary }: BillsTableProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      if (statusFilter !== "ALL" && bill.status !== statusFilter) return false;
      if (paymentFilter !== "ALL" && bill.paymentMode !== paymentFilter)
        return false;
      if (fromDate) {
        const from = fromDate.split("-").reverse().join("-");
        if (new Date(bill.billDate) < new Date(from)) return false;
      }
      if (toDate) {
        const to = toDate.split("-").reverse().join("-");
        if (new Date(bill.billDate) > new Date(to)) return false;
      }
      return true;
    });
  }, [bills, statusFilter, paymentFilter, fromDate, toDate]);

  async function handleCancel(id: string) {
    if (!confirm("Cancel this bill?")) return;
    try {
      await cancelBill(id);
      toast.success("Bill cancelled");
      router.refresh();
    } catch {
      toast.error("Failed to cancel bill");
    }
  }

  const statusVariant = (s: BillStatus) => {
    if (s === "CONFIRMED") return "confirmed";
    if (s === "CANCELLED") return "cancelled";
    return "draft";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 rounded border bg-gray-50 p-3 text-sm">
        <div>
          <span className="text-muted-foreground">Today&apos;s Sales: </span>
          <IndianCurrency amount={summary.totalSales} />
        </div>
        <div>
          <span className="text-muted-foreground">Count: </span>
          {summary.count}
        </div>
        <div>
          <span className="text-muted-foreground">Cash Collected: </span>
          <IndianCurrency amount={summary.cashCollected} />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Payment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Payment</SelectItem>
            {(["CASH", "CARD", "UPI", "CHEQUE", "MULTIPLE"] as PaymentMode[]).map(
              (m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <Input
          placeholder="From DD-MM-YYYY"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-36"
        />
        <Input
          placeholder="To DD-MM-YYYY"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-36"
        />
        <div className="flex-1" />
        <Link href="/bills/new">
          <Button>New Bill</Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bill No</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>Balance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((bill) => (
            <TableRow key={bill.id}>
              <TableCell className="font-mono text-xs">
                {bill.billNumber || "—"}
              </TableCell>
              <TableCell>{formatDateDDMMYYYY(bill.billDate)}</TableCell>
              <TableCell>
                {bill.customer?.name ?? bill.walkInName ?? "Walk-in"}
              </TableCell>
              <TableCell>{bill.items.length}</TableCell>
              <TableCell>
                <IndianCurrency amount={Number(bill.totalAmount)} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={Number(bill.amountPaid)} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={Number(bill.balanceDue)} />
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant(bill.status)}>
                  {bill.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Link href={`/bills/${bill.id}/print`}>
                    <Button variant="outline" size="sm">
                      Print
                    </Button>
                  </Link>
                  {bill.status === "CONFIRMED" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleCancel(bill.id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">
                No bills found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
