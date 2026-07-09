"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChitMember, Customer, ChitScheme, PaymentMode } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { collectChitInstalment } from "@/lib/actions/chitPayments";
import { toISODate } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

type MemberOption = ChitMember & {
  customer: Customer;
  scheme: ChitScheme;
  payments: { instalmentNumber: number }[];
};

interface CollectInstalmentFormProps {
  members: MemberOption[];
  defaultMemberId?: string;
}

export function CollectInstalmentForm({
  members,
  defaultMemberId,
}: CollectInstalmentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState(defaultMemberId || "");
  const [paymentDate, setPaymentDate] = useState(toISODate(new Date()));
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [notes, setNotes] = useState("");

  const member = members.find((m) => m.id === memberId);
  const nextInstalment = member ? member.payments.length + 1 : 0;
  const amount = member ? Number(member.scheme.instalmentAmount) : 0;

  async function handleSubmit() {
    if (!memberId) {
      toast.error("Select member");
      return;
    }
    setLoading(true);
    try {
      const payment = await collectChitInstalment({
        memberId,
        paymentDate: new Date(paymentDate),
        paymentMode,
        notes: notes || undefined,
      });
      toast.success(`Receipt ${payment.receiptNumber} — Instalment ${payment.instalmentNumber}`);
      router.push(`/schemes/members/${memberId}`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Label>Member *</Label>
        <Select value={memberId} onValueChange={setMemberId}>
          <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.memberId} — {m.customer.name} ({m.payments.length}/{m.scheme.durationMonths})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {member && (
        <div className="rounded bg-gray-50 p-3 text-sm space-y-1">
          <p>Scheme: {member.scheme.schemeName}</p>
          <p>Next instalment: <strong>#{nextInstalment}</strong></p>
          <p>Amount: <IndianCurrency amount={amount} className="font-semibold inline" /></p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Payment Date</Label>
          <Input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
        </div>
        <div>
          <Label>Payment Mode</Label>
          <Select value={paymentMode} onValueChange={(v) => setPaymentMode(v as PaymentMode)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="UPI">UPI</SelectItem>
              <SelectItem value="CARD">Card</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Notes</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button onClick={handleSubmit} disabled={loading || !memberId}>
        {loading ? "Collecting..." : "Collect Instalment"}
      </Button>
    </div>
  );
}
