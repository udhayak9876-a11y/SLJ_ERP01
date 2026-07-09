"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { LedgerAccount, PaymentMode, VoucherType } from "@prisma/client";
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
import { createVoucher } from "@/lib/actions/vouchers";
import { toISODate } from "@/lib/utils/date";

interface VoucherFormProps {
  accounts: LedgerAccount[];
}

export function VoucherForm({ accounts }: VoucherFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = (searchParams.get("type") as VoucherType) || "RECEIPT";

  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<VoucherType>(defaultType);
  const [date, setDate] = useState(toISODate(new Date()));
  const [partyName, setPartyName] = useState("");
  const [amount, setAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("CASH");
  const [narration, setNarration] = useState("");
  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");

  async function handleSubmit() {
    if (!partyName || amount <= 0) {
      toast.error("Party name and amount required");
      return;
    }
    setLoading(true);
    try {
      const debitAcc = accounts.find((a) => a.id === debitAccount);
      const creditAcc = accounts.find((a) => a.id === creditAccount);
      await createVoucher({
        date: new Date(date),
        type,
        partyName,
        amount,
        paymentMode,
        narration: narration || undefined,
        debitAccountCode: debitAcc?.accountCode,
        creditAccountCode: creditAcc?.accountCode,
      });
      toast.success("Voucher created");
      router.push("/accounting/vouchers");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as VoucherType)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="RECEIPT">Receipt</SelectItem>
            <SelectItem value="PAYMENT">Payment</SelectItem>
            <SelectItem value="JOURNAL">Journal</SelectItem>
            <SelectItem value="ISSUE">Issue</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div>
        <Label>Party Name</Label>
        <Input value={partyName} onChange={(e) => setPartyName(e.target.value)} />
      </div>
      <div>
        <Label>Amount (₹)</Label>
        <Input type="number" step="0.01" value={amount || ""} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
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
      {type === "JOURNAL" && (
        <>
          <div>
            <Label>Debit Account (override)</Label>
            <Select value={debitAccount} onValueChange={setDebitAccount}>
              <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.accountCode} — {a.accountName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Credit Account (override)</Label>
            <Select value={creditAccount} onValueChange={setCreditAccount}>
              <SelectTrigger><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                {accounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.accountCode} — {a.accountName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      <div>
        <Label>Narration</Label>
        <Textarea value={narration} onChange={(e) => setNarration(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>Save Voucher</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
