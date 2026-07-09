"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Customer, ChitScheme } from "@prisma/client";
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
import { enrolChitMember } from "@/lib/actions/chitMembers";
import { toISODate } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";

interface MemberEnrolFormProps {
  schemes: ChitScheme[];
  customers: Customer[];
  defaultSchemeId?: string;
}

export function MemberEnrolForm({
  schemes,
  customers,
  defaultSchemeId,
}: MemberEnrolFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [schemeId, setSchemeId] = useState(defaultSchemeId || "");
  const [customerId, setCustomerId] = useState("");
  const [enrolmentDate, setEnrolmentDate] = useState(toISODate(new Date()));
  const [notes, setNotes] = useState("");

  const scheme = schemes.find((s) => s.id === schemeId);

  async function handleSubmit() {
    if (!schemeId || !customerId) {
      toast.error("Select scheme and customer");
      return;
    }
    setLoading(true);
    try {
      const member = await enrolChitMember({
        schemeId,
        customerId,
        enrolmentDate: new Date(enrolmentDate),
        notes: notes || undefined,
      });
      toast.success(`Member ${member.memberId} enrolled`);
      router.push(`/schemes/members/${member.id}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div>
        <Label>Scheme *</Label>
        <Select value={schemeId} onValueChange={setSchemeId}>
          <SelectTrigger><SelectValue placeholder="Select scheme" /></SelectTrigger>
          <SelectContent>
            {schemes.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.schemeCode} — {s.schemeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Customer *</Label>
        <Select value={customerId} onValueChange={setCustomerId}>
          <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
          <SelectContent>
            {customers.filter((c) => c.isActive).map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Enrolment Date</Label>
        <Input type="date" value={enrolmentDate} onChange={(e) => setEnrolmentDate(e.target.value)} />
      </div>
      {scheme && (
        <div className="rounded bg-gray-50 p-3 text-sm">
          <p>{scheme.durationMonths} months × <IndianCurrency amount={Number(scheme.instalmentAmount)} /> = <IndianCurrency amount={Number(scheme.instalmentAmount) * scheme.durationMonths} className="font-semibold inline" /></p>
        </div>
      )}
      <div>
        <Label>Notes</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={loading}>{loading ? "Enrolling..." : "Enrol Member"}</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  );
}
