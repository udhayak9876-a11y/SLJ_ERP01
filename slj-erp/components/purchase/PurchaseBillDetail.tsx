"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PurchaseBill,
  PurchaseBillItem,
  Supplier,
  Item,
  Tag,
  Lot,
} from "@prisma/client";
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
import { WeightDisplay } from "@/components/shared/WeightDisplay";
import {
  confirmPurchaseBill,
  cancelPurchaseBill,
} from "@/lib/actions/purchases";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import Link from "next/link";

type BillDetail = PurchaseBill & {
  supplier: Supplier;
  lot: Lot | null;
  items: (PurchaseBillItem & {
    product: Item;
    tag: Tag | null;
  })[];
};

interface PurchaseBillDetailProps {
  bill: BillDetail;
}

export function PurchaseBillDetail({ bill }: PurchaseBillDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    try {
      await confirmPurchaseBill(bill.id);
      toast.success("Purchase confirmed — tags created");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to confirm");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    const reason = prompt("Cancellation reason:");
    if (!reason) return;
    setLoading(true);
    try {
      await cancelPurchaseBill(bill.id, reason);
      toast.success("Purchase cancelled");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to cancel");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold font-mono">
            {bill.billNumber ?? "Draft Purchase"}
          </h2>
          <p className="text-muted-foreground">
            {bill.supplier.companyName} · {formatDateDDMMYYYY(bill.billDate)}
          </p>
        </div>
        <Badge>{bill.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Invoice</p>
          <p>{bill.invoiceNumber ?? "—"}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Metal</p>
          <p>{bill.metalType}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Lot</p>
          {bill.lot ? (
            <Link href={`/stock/lots/${bill.lot.id}`} className="text-gold underline">
              {bill.lot.lotNumber}
            </Link>
          ) : (
            "—"
          )}
        </div>
        <div>
          <p className="text-muted-foreground">Total</p>
          <IndianCurrency amount={Number(bill.totalAmount)} className="font-semibold" />
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Net Wt</TableHead>
            <TableHead>HUID</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tag</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bill.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.product.itemName}</TableCell>
              <TableCell>
                <WeightDisplay weight={Number(item.netWeight)} />
              </TableCell>
              <TableCell className="font-mono text-xs">
                {item.huidNumber ?? "—"}
              </TableCell>
              <TableCell>
                <IndianCurrency amount={Number(item.purchaseRate)} />
              </TableCell>
              <TableCell>
                <IndianCurrency amount={Number(item.amount)} />
              </TableCell>
              <TableCell>
                {item.tag ? (
                  <Link href={`/stock/tags/${item.tag.id}`} className="text-gold underline font-mono text-xs">
                    {item.tag.tagId}
                  </Link>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {bill.status === "DRAFT" && (
        <div className="flex gap-2">
          <Button onClick={handleConfirm} disabled={loading}>
            Confirm & Create Tags
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={loading}>
            Cancel Bill
          </Button>
        </div>
      )}

      {bill.status === "CONFIRMED" && (
        <Link href={`/purchase/returns/new?billId=${bill.id}`}>
          <Button variant="outline">Create Purchase Return</Button>
        </Link>
      )}
    </div>
  );
}
