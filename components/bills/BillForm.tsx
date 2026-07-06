"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BillType, PaymentMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { BillLineItems } from "@/components/bills/BillLineItems";
import {
  QuickAddCustomer,
  type QuickAddResult,
} from "@/components/customers/QuickAddCustomer";
import { createBill, type BillInput } from "@/lib/actions/bills";
import {
  computeLine,
  emptyLine,
  type CustomerOption,
  type ItemOption,
  type LineInput,
  type TodayRates,
} from "@/lib/billing";
import { isIntraState, round2 } from "@/lib/utils/gst";
import { formatINR } from "@/lib/utils/currency";
import { todayISO } from "@/lib/utils/date";

interface BillFormProps {
  items: ItemOption[];
  customers: CustomerOption[];
  rates: TodayRates | null;
}

const WALK_IN = "__walkin__";

export function BillForm({ items, customers: initialCustomers, rates }: BillFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [customers, setCustomers] = useState(initialCustomers);
  const [billDate, setBillDate] = useState(todayISO());
  const [billType, setBillType] = useState<BillType>("CASH");
  const [customerId, setCustomerId] = useState<string>(WALK_IN);
  const [customerSearch, setCustomerSearch] = useState("");
  const [walkInName, setWalkInName] = useState("");
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [lines, setLines] = useState<LineInput[]>([emptyLine()]);
  const [discountStr, setDiscountStr] = useState("");
  const [paidStr, setPaidStr] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState<"draft" | "confirm" | null>(null);

  const selectedCustomer =
    customerId !== WALK_IN
      ? customers.find((c) => c.id === customerId) ?? null
      : null;

  const intraState = isIntraState(selectedCustomer?.state);

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.customerCode.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, customerSearch]);

  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const computed = useMemo(
    () => lines.map((line) => computeLine(line, itemById.get(line.itemId), rates)),
    [lines, itemById, rates]
  );

  const totals = useMemo(() => {
    const subtotal = round2(computed.reduce((s, c) => s + c.taxableAmount, 0));
    const totalGst = round2(computed.reduce((s, c) => s + c.gstAmount, 0));
    const cgst = intraState ? round2(totalGst / 2) : 0;
    const sgst = intraState ? round2(totalGst - cgst) : 0;
    const igst = intraState ? 0 : totalGst;

    const discount = parseFloat(discountStr) || 0;
    const beforeRound = subtotal + totalGst - discount;
    const totalAmount = Math.round(beforeRound);
    const roundOff = round2(totalAmount - beforeRound);

    const amountPaid = parseFloat(paidStr) || 0;
    const balanceDue = round2(totalAmount - amountPaid);

    return {
      subtotal,
      cgst,
      sgst,
      igst,
      discount,
      roundOff,
      totalAmount,
      amountPaid,
      balanceDue,
    };
  }, [computed, intraState, discountStr, paidStr]);

  function handleQuickAdd(added: QuickAddResult) {
    setCustomers((prev) => [
      ...prev,
      {
        id: added.customerId,
        customerCode: added.customerCode,
        name: added.name,
        phone: "",
        state: "Tamil Nadu",
        gstin: null,
        address: "",
        city: "Tiruppur",
      },
    ]);
    setCustomerId(added.customerId);
  }

  function validate(): string | null {
    if (!rates) {
      return "Today's gold rate is not set. Enter it on the Gold Rates page first.";
    }
    if (customerId === WALK_IN && billType !== "CASH") {
      return "Credit/Exchange bills require a registered customer.";
    }
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.itemId) return `Row ${i + 1}: select an item.`;
      const gross = parseFloat(line.grossWeight);
      if (!gross || gross <= 0) return `Row ${i + 1}: enter a valid gross weight.`;
      if (computed[i].ratePerGram <= 0)
        return `Row ${i + 1}: rate per gram is 0 — check today's rates.`;
    }
    if (totals.discount < 0) return "Discount cannot be negative.";
    if (totals.amountPaid < 0) return "Amount paid cannot be negative.";
    return null;
  }

  async function handleSave(confirm: boolean) {
    const error = validate();
    if (error) {
      toast({ title: error, variant: "destructive" });
      return;
    }

    setSaving(confirm ? "confirm" : "draft");
    try {
      const payload: BillInput = {
        billDate,
        billType,
        customerId: customerId === WALK_IN ? null : customerId,
        walkInName: customerId === WALK_IN ? walkInName.trim() || "Walk-in" : null,
        paymentMode,
        subtotal: totals.subtotal,
        cgstAmount: totals.cgst,
        sgstAmount: totals.sgst,
        igstAmount: totals.igst,
        discountAmount: totals.discount,
        roundOff: totals.roundOff,
        totalAmount: totals.totalAmount,
        amountPaid: totals.amountPaid,
        balanceDue: totals.balanceDue,
        notes: notes || undefined,
        items: lines.map((line, i) => {
          const c = computed[i];
          const item = itemById.get(line.itemId)!;
          return {
            itemId: line.itemId,
            tagNumber: line.tagNumber || undefined,
            description:
              line.description ||
              `${item.itemName}${item.karat ? ` ${item.karat}` : ""}`,
            grossWeight: parseFloat(line.grossWeight),
            stoneWeight: parseFloat(line.stoneWeight) || 0,
            netWeight: c.netWeight,
            wastagePercent: parseFloat(line.wastagePercent) || 0,
            wastageWeight: c.wastageWeight,
            totalWeight: c.totalWeight,
            ratePerGram: c.ratePerGram,
            goldValue: c.goldValue,
            makingChargeType: c.makingChargeType,
            makingChargeValue: c.makingChargeValue,
            makingChargeAmount: c.makingChargeAmount,
            stoneCharge: c.stoneCharge,
            taxableAmount: c.taxableAmount,
            gstRate: c.gstRate,
            gstAmount: c.gstAmount,
            lineTotal: c.lineTotal,
          };
        }),
      };

      const result = await createBill(payload, confirm);
      if (confirm) {
        toast({
          title: `Bill ${result.billNumber} confirmed`,
          variant: "success",
        });
        router.push(`/bills/${result.billId}/print`);
      } else {
        toast({ title: "Bill saved as draft", variant: "success" });
        router.push("/bills");
      }
      router.refresh();
    } catch {
      toast({ title: "Failed to save bill", variant: "destructive" });
      setSaving(null);
    }
  }

  return (
    <div className="space-y-4">
      {!rates && (
        <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          ⚠ Today&apos;s gold rate is not entered. Rates are required for billing —{" "}
          <a href="/rates" className="underline">
            enter now
          </a>
          .
        </div>
      )}

      {/* SECTION A — Bill header */}
      <div className="grid grid-cols-1 gap-4 rounded-md border bg-gray-50 p-4 md:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="billDate">Bill Date</Label>
          <Input
            id="billDate"
            type="date"
            value={billDate}
            onChange={(e) => setBillDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Bill Type</Label>
          <RadioGroup
            value={billType}
            onValueChange={(v) => setBillType(v as BillType)}
            className="flex gap-4 pt-2"
          >
            {(["CASH", "CREDIT", "EXCHANGE"] as const).map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <RadioGroupItem value={t} id={`bt-${t}`} />
                <Label htmlFor={`bt-${t}`} className="font-normal capitalize">
                  {t.toLowerCase()}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="space-y-1.5">
          <Label>Customer</Label>
          <div className="flex gap-1.5">
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <div className="p-1">
                  <Input
                    placeholder="Search name / phone / code…"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="h-8 text-xs"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                </div>
                <SelectItem value={WALK_IN}>Walk-in (no account)</SelectItem>
                {filteredCustomers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.customerCode} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <QuickAddCustomer onAdded={handleQuickAdd} />
          </div>
          {customerId === WALK_IN && (
            <Input
              placeholder="Walk-in customer name"
              value={walkInName}
              onChange={(e) => setWalkInName(e.target.value)}
              className="mt-1.5"
            />
          )}
          {selectedCustomer && (
            <p className="text-xs text-muted-foreground">
              {selectedCustomer.city}, {selectedCustomer.state}
              {!intraState && " — IGST applies"}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Payment Mode</Label>
          <Select
            value={paymentMode}
            onValueChange={(v) => setPaymentMode(v as PaymentMode)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CHEQUE">Cheque</SelectItem>
              <SelectItem value="MULTIPLE">Multiple</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* SECTION B — Line items */}
      <BillLineItems lines={lines} items={items} rates={rates} onChange={setLines} />

      {/* SECTION C — Totals panel */}
      <div className="flex justify-end">
        <div className="w-full max-w-sm space-y-2 rounded-md border bg-gray-50 p-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-medium tabular-nums">
              {formatINR(totals.subtotal, 2)}
            </span>
          </div>

          {intraState ? (
            <>
              <div className="flex justify-between text-muted-foreground">
                <span>CGST (1.5%)</span>
                <span className="tabular-nums">{formatINR(totals.cgst, 2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>SGST (1.5%)</span>
                <span className="tabular-nums">{formatINR(totals.sgst, 2)}</span>
              </div>
            </>
          ) : (
            <div className="flex justify-between text-muted-foreground">
              <span>IGST (3%)</span>
              <span className="tabular-nums">{formatINR(totals.igst, 2)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Discount (₹)</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={discountStr}
              onChange={(e) => setDiscountStr(e.target.value)}
              className="h-8 w-28 text-right tabular-nums"
            />
          </div>

          <div className="flex justify-between text-muted-foreground">
            <span>Round Off</span>
            <span className="tabular-nums">
              {totals.roundOff >= 0 ? "+" : ""}
              {formatINR(totals.roundOff, 2)}
            </span>
          </div>

          <div className="flex justify-between border-t pt-2 text-lg font-bold text-navy">
            <span>TOTAL</span>
            <span className="tabular-nums">{formatINR(totals.totalAmount)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Amount Paid (₹)</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={paidStr}
              onChange={(e) => setPaidStr(e.target.value)}
              className="h-8 w-28 text-right tabular-nums"
            />
          </div>

          <div className="flex justify-between font-semibold">
            <span>Balance Due</span>
            <span
              className={`tabular-nums ${totals.balanceDue > 0 ? "text-red-600" : "text-green-700"}`}
            >
              {formatINR(totals.balanceDue, 2)}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            <Label htmlFor="billNotes" className="text-xs">
              Notes
            </Label>
            <Input
              id="billNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional"
              className="h-8"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              disabled={saving !== null}
              onClick={() => handleSave(false)}
            >
              {saving === "draft" ? "Saving…" : "Save as Draft"}
            </Button>
            <Button
              type="button"
              className="flex-1"
              disabled={saving !== null}
              onClick={() => handleSave(true)}
            >
              {saving === "confirm" ? "Confirming…" : "Confirm & Print"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
