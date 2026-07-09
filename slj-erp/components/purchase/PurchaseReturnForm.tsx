"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PurchaseBill, Supplier, PurchaseBillItem, Item, Tag } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPurchaseReturn } from "@/lib/actions/purchaseReturns";
import { toISODate } from "@/lib/utils/date";
import { WeightDisplay } from "@/components/shared/WeightDisplay";

type BillWithItems = PurchaseBill & {
  supplier: Supplier;
  items: (PurchaseBillItem & { product: Item; tag: Tag | null })[];
};

interface PurchaseReturnFormProps {
  bills: BillWithItems[];
  defaultBillId?: string;
}

export function PurchaseReturnForm({ bills, defaultBillId }: PurchaseReturnFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [billId, setBillId] = useState(defaultBillId || "");
  const [returnDate, setReturnDate] = useState(toISODate(new Date()));
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const selectedBill = bills.find((b) => b.id === billId);
  const returnableItems =
    selectedBill?.items.filter(
      (i) => i.tag && ["RECEIVED", "COUNTER_ASSIGNED"].includes(i.tag.status)
    ) ?? [];

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  }

  async function handleSubmit(confirm: boolean) {
    if (!billId || selectedTags.length === 0 || !reason.trim()) {
      toast.error("Select bill, tags, and enter reason");
      return;
    }

    setLoading(true);
    try {
      await createPurchaseReturn({
        originalBillId: billId,
        returnDate: new Date(returnDate),
        reason,
        tagIds: selectedTags,
        notes: notes || undefined,
        confirm,
      });
      toast.success(confirm ? "Return confirmed" : "Return saved as draft");
      router.push("/purchase/returns");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <Label>Original Purchase Bill</Label>
        <select
          className="w-full border rounded-md h-10 px-3 text-sm"
          value={billId}
          onChange={(e) => {
            setBillId(e.target.value);
            setSelectedTags([]);
          }}
        >
          <option value="">Select bill</option>
          {bills.map((b) => (
            <option key={b.id} value={b.id}>
              {b.billNumber} — {b.supplier.companyName}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Return Date</Label>
          <Input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} />
        </div>
        <div>
          <Label>Reason *</Label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </div>

      {returnableItems.length > 0 && (
        <div>
          <Label>Select tags to return</Label>
          <div className="border rounded-md divide-y mt-1">
            {returnableItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={item.tag ? selectedTags.includes(item.tag.id) : false}
                  onChange={() => item.tag && toggleTag(item.tag.id)}
                />
                <span className="font-mono text-xs">{item.tag?.tagId}</span>
                <span>{item.product.itemName}</span>
                <WeightDisplay weight={Number(item.netWeight)} />
              </label>
            ))}
          </div>
        </div>
      )}

      {billId && returnableItems.length === 0 && (
        <p className="text-sm text-muted-foreground">No returnable tags on this bill</p>
      )}

      <div>
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>

      <div className="flex gap-2">
        <Button disabled={loading} onClick={() => handleSubmit(true)}>
          Confirm Return
        </Button>
        <Button variant="outline" disabled={loading} onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
