"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Printer, Ban, CheckCircle2 } from "lucide-react";
import { BillStatus, PaymentMode } from "@prisma/client";
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
import { cancelBill, confirmBill } from "@/lib/actions/bills";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { formatDate } from "@/lib/utils/date";

export interface BillRow {
  id: string;
  billNumber: string;
  billDate: string;
  customerName: string;
  itemCount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode: PaymentMode;
  status: BillStatus;
}

const STATUS_BADGE: Record<BillStatus, "gray" | "success" | "red"> = {
  DRAFT: "gray",
  CONFIRMED: "success",
  CANCELLED: "red",
};

export function BillsTable({ bills }: { bills: BillRow[] }) {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("ALL");
  const [payment, setPayment] = useState<string>("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [pending, setPending] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      if (status !== "ALL" && b.status !== status) return false;
      if (payment !== "ALL" && b.paymentMode !== payment) return false;
      const d = b.billDate.slice(0, 10);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [bills, status, payment, fromDate, toDate]);

  async function handleCancel(bill: BillRow) {
    if (
      !window.confirm(
        `Cancel bill ${bill.billNumber !== "—" ? bill.billNumber : "(draft)"}? This cannot be undone.`
      )
    ) {
      return;
    }
    setPending(bill.id);
    try {
      const result = await cancelBill(bill.id);
      if (result.success) {
        toast({ title: "Bill cancelled", variant: "success" });
      } else {
        toast({ title: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to cancel bill", variant: "destructive" });
    } finally {
      setPending(null);
    }
  }

  async function handleConfirm(bill: BillRow) {
    setPending(bill.id);
    try {
      const result = await confirmBill(bill.id);
      if (result.success) {
        toast({
          title: `Bill confirmed as ${result.billNumber}`,
          variant: "success",
        });
      } else {
        toast({ title: result.error, variant: "destructive" });
      }
    } catch {
      toast({ title: "Failed to confirm bill", variant: "destructive" });
    } finally {
      setPending(null);
    }
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">From</span>
          <Input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-40"
          />
          <span className="text-muted-foreground">To</span>
          <Input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-40"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="CONFIRMED">Confirmed</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={payment} onValueChange={setPayment}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Payments</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="CARD">Card</SelectItem>
            <SelectItem value="UPI">UPI</SelectItem>
            <SelectItem value="CHEQUE">Cheque</SelectItem>
            <SelectItem value="MULTIPLE">Multiple</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill No</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead className="text-center">Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-right">Paid</TableHead>
              <TableHead className="text-right">Balance</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-40">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-6 text-center text-muted-foreground">
                  No bills found.
                </TableCell>
              </TableRow>
            )}
            {filtered.map((bill) => (
              <TableRow key={bill.id}>
                <TableCell className="font-mono font-medium">{bill.billNumber}</TableCell>
                <TableCell className="tabular-nums">{formatDate(bill.billDate)}</TableCell>
                <TableCell>{bill.customerName}</TableCell>
                <TableCell className="text-center">{bill.itemCount}</TableCell>
                <TableCell className="text-right">
                  <IndianCurrency amount={bill.totalAmount} className="font-medium" />
                </TableCell>
                <TableCell className="text-right">
                  <IndianCurrency amount={bill.amountPaid} />
                </TableCell>
                <TableCell className="text-right">
                  <IndianCurrency
                    amount={bill.balanceDue}
                    className={bill.balanceDue > 0 ? "font-semibold text-red-600" : ""}
                  />
                </TableCell>
                <TableCell className="capitalize">
                  {bill.paymentMode.toLowerCase()}
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[bill.status]}>{bill.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild title="View / Print">
                      <Link href={`/bills/${bill.id}/print`}>
                        <Printer className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    {bill.status === "DRAFT" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Confirm bill"
                        disabled={pending === bill.id}
                        onClick={() => handleConfirm(bill)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      </Button>
                    )}
                    {bill.status !== "CANCELLED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        title="Cancel bill"
                        disabled={pending === bill.id}
                        onClick={() => handleCancel(bill)}
                      >
                        <Ban className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
