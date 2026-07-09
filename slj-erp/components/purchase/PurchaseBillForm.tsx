"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Item, Supplier, MetalType, PaymentMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createPurchaseBill } from "@/lib/actions/purchases";
import { roundMoney, roundWeight } from "@/lib/utils/weight";
import { toISODate } from "@/lib/utils/date";

interface LineRow {
  id: string;
  productId: string;
  grossWeight: number;
  stoneWeight: number;
  huidNumber: string;
  purchaseRate: number;
}

interface PurchaseBillFormProps {
  suppliers: Supplier[];
  products: Item[];
}

function newLine(): LineRow {
  return {
    id: crypto.randomUUID(),
    productId: "",
    grossWeight: 0,
    stoneWeight: 0,
    huidNumber: "",
    purchaseRate: 0,
  };
}

export function PurchaseBillForm({ suppliers, products }: PurchaseBillFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [billDate, setBillDate] = useState(toISODate(new Date()));
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [metalType, setMetalType] = useState<MetalType>("GOLD");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<LineRow[]>([newLine()]);

  function updateLine(id: string, patch: Partial<LineRow>) {
    setLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...patch } : l))
    );
  }

  function addLine() {
    setLines((prev) => [...prev, newLine()]);
  }

  function removeLine(id: string) {
    setLines((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  const lineCalcs = lines.map((l) => {
    const netWeight = roundWeight(l.grossWeight - l.stoneWeight);
    const amount = roundMoney(netWeight * l.purchaseRate);
    return { ...l, netWeight, amount };
  });

  const totalAmount = lineCalcs.reduce((s, l) => s + l.amount, 0);

  async function handleSubmit(status: "DRAFT" | "CONFIRMED") {
    if (!supplierId) {
      toast.error("Select supplier");
      return;
    }
    const valid = lineCalcs.filter((l) => l.productId && l.grossWeight > 0);
    if (valid.length === 0) {
      toast.error("Add at least one item with weight");
      return;
    }

    setLoading(true);
    try {
      const bill = await createPurchaseBill({
        billDate: new Date(billDate),
        supplierId,
        invoiceNumber: invoiceNumber || undefined,
        metalType,
        paymentMode,
        notes: notes || undefined,
        status,
        items: valid.map((l, i) => ({
          productId: l.productId,
          grossWeight: l.grossWeight,
          stoneWeight: l.stoneWeight,
          netWeight: l.netWeight,
          huidNumber: l.huidNumber || undefined,
          purchaseRate: l.purchaseRate,
          amount: l.amount,
          sortOrder: i,
        })),
      });
      toast.success(
        status === "CONFIRMED"
          ? `Purchase ${bill.billNumber} confirmed — tags created`
          : "Purchase saved as draft"
      );
      router.push(`/purchase/bills/${bill.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl">
        <div>
          <Label>Supplier *</Label>
          <Select value={supplierId} onValueChange={setSupplierId}>
            <SelectTrigger>
              <SelectValue placeholder="Select supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.supplierCode} — {s.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Bill Date</Label>
          <Input type="date" value={billDate} onChange={(e) => setBillDate(e.target.value)} />
        </div>
        <div>
          <Label>Supplier Invoice No.</Label>
          <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
        </div>
        <div>
          <Label>Metal Type</Label>
          <Select value={metalType} onValueChange={(v) => setMetalType(v as MetalType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
              <SelectItem value="DIAMOND">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Payment Mode</Label>
          <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label className="text-base">Line Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addLine}>
            + Add Item
          </Button>
        </div>
        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Gross (g)</TableHead>
                <TableHead>Stone (g)</TableHead>
                <TableHead>Net (g)</TableHead>
                <TableHead>HUID</TableHead>
                <TableHead>Rate/g</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lineCalcs.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="min-w-[160px]">
                    <Select
                      value={l.productId || "none"}
                      onValueChange={(v) =>
                        updateLine(l.id, { productId: v === "none" ? "" : v })
                      }
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Product" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.itemName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      className="h-8 w-24"
                      value={l.grossWeight || ""}
                      onChange={(e) =>
                        updateLine(l.id, { grossWeight: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.001"
                      className="h-8 w-24"
                      value={l.stoneWeight || ""}
                      onChange={(e) =>
                        updateLine(l.id, { stoneWeight: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </TableCell>
                  <TableCell className="text-sm">{l.netWeight.toFixed(3)}</TableCell>
                  <TableCell>
                    {metalType === "GOLD" ? (
                      <Input
                        className="h-8 w-20 font-mono uppercase"
                        maxLength={6}
                        value={l.huidNumber}
                        onChange={(e) =>
                          updateLine(l.id, { huidNumber: e.target.value.toUpperCase() })
                        }
                      />
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      className="h-8 w-24"
                      value={l.purchaseRate || ""}
                      onChange={(e) =>
                        updateLine(l.id, { purchaseRate: parseFloat(e.target.value) || 0 })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <IndianCurrency amount={l.amount} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => removeLine(l.id)}>
                      ×
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-right mt-2 font-semibold">
          Total: <IndianCurrency amount={totalAmount} />
        </p>
      </div>

      <div>
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button disabled={loading} onClick={() => handleSubmit("CONFIRMED")}>
          {loading ? "Saving..." : "Confirm & Create Tags"}
        </Button>
        <Button variant="outline" disabled={loading} onClick={() => handleSubmit("DRAFT")}>
          Save Draft
        </Button>
        <Button variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
