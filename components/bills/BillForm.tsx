"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Customer, Item } from "@prisma/client";
import { BillType, PaymentMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BillLineItems,
  createInitialLines,
  LineItemRow,
  useBillTotals,
} from "@/components/bills/BillLineItems";
import {
  QuickAddCustomer,
  QuickAddCustomerResult,
} from "@/components/customers/QuickAddCustomer";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { createBill } from "@/lib/actions/bills";
import { formatDateDDMMYYYY, parseDDMMYYYY } from "@/lib/utils/date";

interface BillFormProps {
  items: Item[];
  customers: Customer[];
  rates: {
    gold24kRate: number;
    gold22kRate: number;
    gold18kRate: number;
    silverRate: number;
  } | null;
}

export function BillForm({ items, customers, rates }: BillFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [billDateStr, setBillDateStr] = useState(formatDateDDMMYYYY(new Date()));
  const [billType, setBillType] = useState<BillType>("CASH");
  const [customerId, setCustomerId] = useState<string>("");
  const [walkInName, setWalkInName] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [amountPaid, setAmountPaid] = useState(0);
  const [lines, setLines] = useState<LineItemRow[]>(createInitialLines);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [extraCustomers, setExtraCustomers] = useState<Customer[]>([]);

  const allCustomers = [...customers, ...extraCustomers];
  const selectedCustomer = allCustomers.find((c) => c.id === customerId);
  const customerState = selectedCustomer?.state ?? "Tamil Nadu";
  const isTamilNadu = customerState === "Tamil Nadu";

  const totals = useBillTotals(
    lines,
    customerState,
    discountAmount,
    amountPaid
  );

  function handleQuickAdd(customer: QuickAddCustomerResult) {
    setExtraCustomers((prev) => [
      ...prev,
      {
        id: customer.customerId,
        customerCode: customer.customerCode,
        name: customer.name,
        phone: "",
        state: "Tamil Nadu",
        city: "Tiruppur",
      } as Customer,
    ]);
    setCustomerId(customer.customerId);
  }

  async function handleSave(status: "DRAFT" | "CONFIRMED") {
    const validLines = lines.filter((l) => l.itemId);
    if (validLines.length === 0) {
      toast.error("Add at least one item");
      return;
    }

    const billDate = parseDDMMYYYY(billDateStr);
    if (!billDate) {
      toast.error("Invalid bill date");
      return;
    }

    setLoading(true);
    try {
      const bill = await createBill({
        billDate,
        billType,
        customerId: customerId || undefined,
        walkInName: !customerId ? walkInName : undefined,
        customerState,
        paymentMode,
        discountAmount,
        amountPaid,
        status,
        items: validLines.map((l, i) => ({
          itemId: l.itemId,
          tagNumber: l.tagNumber,
          description: l.description,
          grossWeight: l.grossWeight,
          stoneWeight: l.stoneWeight,
          netWeight: l.netWeight,
          wastagePercent: l.wastagePercent,
          wastageWeight: l.wastageWeight,
          totalWeight: l.totalWeight,
          ratePerGram: l.ratePerGram,
          goldValue: l.goldValue,
          makingChargeType: l.makingChargeType,
          makingChargeValue: l.makingChargeValue,
          makingChargeAmount: l.makingChargeAmount,
          stoneCharge: l.stoneCharge,
          taxableAmount: l.taxableAmount,
          gstRate: l.gstRate,
          gstAmount: l.gstAmount,
          lineTotal: l.lineTotal,
          sortOrder: i,
        })),
      });

      toast.success(
        status === "DRAFT" ? "Bill saved as draft" : "Bill confirmed"
      );

      if (status === "CONFIRMED") {
        router.push(`/bills/${bill.id}/print`);
      } else {
        router.push("/bills");
      }
    } catch {
      toast.error("Failed to save bill");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Bill Header</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="space-y-1">
            <Label>Bill Date</Label>
            <Input
              value={billDateStr}
              onChange={(e) => setBillDateStr(e.target.value)}
              placeholder="DD-MM-YYYY"
            />
          </div>

          <div className="space-y-1">
            <Label>Bill Type</Label>
            <RadioGroup
              value={billType}
              onValueChange={(v) => setBillType(v as BillType)}
              className="flex gap-3"
            >
              {(["CASH", "CREDIT", "EXCHANGE"] as const).map((t) => (
                <div key={t} className="flex items-center gap-1">
                  <RadioGroupItem value={t} id={t} />
                  <Label htmlFor={t} className="text-xs font-normal">
                    {t}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-1">
            <Label>Customer</Label>
            <div className="flex gap-1">
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {allCustomers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.customerCode} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setQuickAddOpen(true)}
              >
                +
              </Button>
            </div>
          </div>

          {!customerId && (
            <div className="space-y-1">
              <Label>Walk-in Name</Label>
              <Input
                value={walkInName}
                onChange={(e) => setWalkInName(e.target.value)}
                placeholder="Walk-in customer"
              />
            </div>
          )}

          <div className="space-y-1">
            <Label>Payment Mode</Label>
            <Select
              value={paymentMode}
              onValueChange={(v) => setPaymentMode(v as PaymentMode)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["CASH", "CARD", "UPI", "CHEQUE", "MULTIPLE"] as const).map(
                  (m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <BillLineItems
            items={items}
            rates={rates}
            lines={lines}
            onChange={setLines}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Card className="w-80">
          <CardContent className="space-y-2 p-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <IndianCurrency amount={totals.subtotal} />
            </div>
            {isTamilNadu ? (
              <>
                <div className="flex justify-between">
                  <span>CGST (1.5%):</span>
                  <IndianCurrency amount={totals.cgstAmount} />
                </div>
                <div className="flex justify-between">
                  <span>SGST (1.5%):</span>
                  <IndianCurrency amount={totals.sgstAmount} />
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>IGST (3%):</span>
                <IndianCurrency amount={totals.igstAmount} />
              </div>
            )}
            <div className="flex items-center justify-between gap-2">
              <span>Discount:</span>
              <Input
                type="number"
                step="0.01"
                className="h-7 w-24 text-right text-xs"
                value={discountAmount || ""}
                onChange={(e) =>
                  setDiscountAmount(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="flex justify-between">
              <span>Round Off:</span>
              <span>
                {totals.roundOff >= 0 ? "+" : ""}
                <IndianCurrency amount={totals.roundOff} />
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold">
              <span>TOTAL:</span>
              <IndianCurrency amount={totals.totalAmount} />
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Amount Paid:</span>
              <Input
                type="number"
                step="0.01"
                className="h-7 w-24 text-right text-xs"
                value={amountPaid || ""}
                onChange={(e) =>
                  setAmountPaid(parseFloat(e.target.value) || 0)
                }
              />
            </div>
            <div className="flex justify-between font-semibold">
              <span>Balance Due:</span>
              <IndianCurrency amount={totals.balanceDue} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={loading}
                onClick={() => handleSave("DRAFT")}
              >
                Save as Draft
              </Button>
              <Button
                className="flex-1"
                disabled={loading}
                onClick={() => handleSave("CONFIRMED")}
              >
                Confirm & Print
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <QuickAddCustomer
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
        onSuccess={handleQuickAdd}
      />
    </div>
  );
}
