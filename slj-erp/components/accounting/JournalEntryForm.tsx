"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LedgerAccount } from "@prisma/client";
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
import { createManualJournalEntry } from "@/lib/actions/journal";
import { toISODate } from "@/lib/utils/date";

interface JournalEntryFormProps {
  accounts: LedgerAccount[];
}

export function JournalEntryForm({ accounts }: JournalEntryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [entryDate, setEntryDate] = useState(toISODate(new Date()));
  const [description, setDescription] = useState("");
  const [debitAccount, setDebitAccount] = useState("");
  const [creditAccount, setCreditAccount] = useState("");
  const [amount, setAmount] = useState(0);
  const [narration, setNarration] = useState("");

  async function handleSubmit() {
    if (!debitAccount || !creditAccount || amount <= 0 || !description) {
      toast.error("Fill all fields");
      return;
    }
    const debitAcc = accounts.find((a) => a.id === debitAccount);
    const creditAcc = accounts.find((a) => a.id === creditAccount);
    if (!debitAcc || !creditAcc) return;

    setLoading(true);
    try {
      await createManualJournalEntry({
        entryDate: new Date(entryDate),
        description,
        lines: [
          {
            accountCode: debitAcc.accountCode,
            debitAmount: amount,
            creditAmount: 0,
            narration,
            referenceType: "JOURNAL",
          },
          {
            accountCode: creditAcc.accountCode,
            debitAmount: 0,
            creditAmount: amount,
            narration,
            referenceType: "JOURNAL",
          },
        ],
      });
      toast.success("Journal entry created");
      router.push("/accounting/journal");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Label>Date</Label>
        <Input type="date" value={entryDate} onChange={(e) => setEntryDate(e.target.value)} />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div>
        <Label>Debit Account</Label>
        <Select value={debitAccount} onValueChange={setDebitAccount}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {accounts.filter((a) => a.isActive).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.accountCode} — {a.accountName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Credit Account</Label>
        <Select value={creditAccount} onValueChange={setCreditAccount}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {accounts.filter((a) => a.isActive).map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.accountCode} — {a.accountName}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Amount (₹)</Label>
        <Input type="number" step="0.01" value={amount || ""} onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
      </div>
      <div>
        <Label>Narration</Label>
        <Input value={narration} onChange={(e) => setNarration(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : "Post Entry"}</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
