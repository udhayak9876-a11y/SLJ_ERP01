"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { closeDayEnd } from "@/lib/actions/dayEnd";
import { formatDateDDMMYYYY, toISODate } from "@/lib/utils/date";

interface DayEndPanelProps {
  isLocked: boolean;
  existingReport?: Record<string, unknown> | null;
}

export function DayEndPanel({ isLocked, existingReport }: DayEndPanelProps) {
  const router = useRouter();
  const [date, setDate] = useState(toISODate(new Date()));
  const [loading, setLoading] = useState(false);

  async function handleClose() {
    if (!confirm(`Close and lock ${formatDateDDMMYYYY(new Date(date))}? No edits allowed after.`)) return;
    setLoading(true);
    try {
      await closeDayEnd(new Date(date));
      toast.success("Day closed and locked");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4">
      <div>
        <Label>Business Date</Label>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} disabled={isLocked} />
      </div>

      {isLocked && existingReport && (
        <div className="rounded border p-4 space-y-2 text-sm">
          <p className="font-semibold text-green-700">✓ Day is locked</p>
          <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
            {JSON.stringify(existingReport, null, 2)}
          </pre>
        </div>
      )}

      {!isLocked && (
        <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm">
          <p className="font-medium">Day-End Process</p>
          <ol className="list-decimal ml-4 mt-2 space-y-1 text-muted-foreground">
            <li>Tally all sales (cash + card + UPI + credit)</li>
            <li>Tally purchases and old metal buyback</li>
            <li>Calculate closing cash balance</li>
            <li>Lock all transactions for this date</li>
          </ol>
        </div>
      )}

      {!isLocked && (
        <Button onClick={handleClose} disabled={loading} variant="destructive">
          {loading ? "Closing..." : "Close Day & Lock"}
        </Button>
      )}
    </div>
  );
}
