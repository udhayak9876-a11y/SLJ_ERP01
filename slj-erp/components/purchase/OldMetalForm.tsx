"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Customer, MetalType, PaymentMode } from "@prisma/client";
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
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { createOldMetalPurchase } from "@/lib/actions/oldMetalPurchase";
import { roundMoney, roundWeight } from "@/lib/utils/weight";
import { toISODate } from "@/lib/utils/date";

interface OldMetalFormProps {
  customers: Customer[];
}

export function OldMetalForm({ customers }: OldMetalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [voucherDate, setVoucherDate] = useState(toISODate(new Date()));
  const [customerId, setCustomerId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [metalType, setMetalType] = useState<MetalType>("GOLD");
  const [karat, setKarat] = useState("22K");
  const [itemDescription, setItemDescription] = useState("");
  const [grossWeight, setGrossWeight] = useState(0);
  const [stoneWeight, setStoneWeight] = useState(0);
  const [purity, setPurity] = useState(91.6);
  const [ratePerGram, setRatePerGram] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [notes, setNotes] = useState("");

  const netWeight = useMemo(
    () => roundWeight(grossWeight - stoneWeight),
    [grossWeight, stoneWeight]
  );
  const effectiveWeight = useMemo(
    () => roundWeight(netWeight * (purity / 100)),
    [netWeight, purity]
  );
  const totalAmount = useMemo(
    () => roundMoney(effectiveWeight * ratePerGram),
    [effectiveWeight, ratePerGram]
  );

  async function handleSubmit() {
    if (!itemDescription.trim()) {
      toast.error("Description required");
      return;
    }
    if (grossWeight <= 0) {
      toast.error("Enter gross weight");
      return;
    }

    setLoading(true);
    try {
      const record = await createOldMetalPurchase({
        voucherDate: new Date(voucherDate),
        customerId: customerId || undefined,
        customerName: customerName || undefined,
        metalType,
        karat,
        itemDescription,
        grossWeight,
        stoneWeight,
        purity,
        ratePerGram,
        paymentMode,
        notes: notes || undefined,
      });
      toast.success(`Voucher ${record.voucherNumber} created`);
      router.push("/purchase/old-metal");
    } catch {
      toast.error("Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Input type="date" value={voucherDate} onChange={(e) => setVoucherDate(e.target.value)} />
        </div>
        <div>
          <Label>Customer</Label>
          <Select value={customerId || "walkin"} onValueChange={(v) => setCustomerId(v === "walkin" ? "" : v)}>
            <SelectTrigger><SelectValue placeholder="Walk-in" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="walkin">Walk-in</SelectItem>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {!customerId && (
          <div className="col-span-2">
            <Label>Walk-in Name</Label>
            <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          </div>
        )}
        <div>
          <Label>Metal</Label>
          <Select value={metalType} onValueChange={(v) => setMetalType(v as MetalType)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Karat</Label>
          <Input value={karat} onChange={(e) => setKarat(e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>Description *</Label>
          <Input value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} />
        </div>
        <div>
          <Label>Gross Weight (g)</Label>
          <Input type="number" step="0.001" value={grossWeight || ""} onChange={(e) => setGrossWeight(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Label>Stone Weight (g)</Label>
          <Input type="number" step="0.001" value={stoneWeight || ""} onChange={(e) => setStoneWeight(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Label>Purity (%)</Label>
          <Input type="number" step="0.1" value={purity} onChange={(e) => setPurity(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Label>Rate per gram (₹)</Label>
          <Input type="number" step="0.01" value={ratePerGram || ""} onChange={(e) => setRatePerGram(parseFloat(e.target.value) || 0)} />
        </div>
        <div>
          <Label>Payment</Label>
          <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 rounded bg-gray-50 p-3 text-sm space-y-1">
          <p>Net: {netWeight.toFixed(3)} g · Effective: {effectiveWeight.toFixed(3)} g</p>
          <p className="font-semibold">Total: <IndianCurrency amount={totalAmount} /></p>
        </div>
        <div className="col-span-2">
          <Label>Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save Voucher"}
        </Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
