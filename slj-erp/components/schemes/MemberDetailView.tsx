"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChitMember,
  Customer,
  ChitScheme,
  ChitPayment,
  ChitMemberStatus,
} from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { markMemberDefaulted } from "@/lib/actions/chitMembers";
import Link from "next/link";

type MemberDetail = ChitMember & {
  customer: Customer;
  scheme: ChitScheme;
  payments: ChitPayment[];
};

interface MemberDetailViewProps {
  member: MemberDetail;
  instalments: {
    number: number;
    paid: boolean;
    payment?: ChitPayment;
    dueDate: Date;
  }[];
  paidCount: number;
  remaining: number;
  totalPaid: number;
  isMature: boolean;
}

const STATUS_VARIANT: Record<ChitMemberStatus, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  CLOSED: "secondary",
  DEFAULTED: "destructive",
};

export function MemberDetailView({
  member,
  instalments,
  paidCount,
  remaining,
  totalPaid,
  isMature,
}: MemberDetailViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDefault() {
    if (!confirm("Mark member as defaulted?")) return;
    setLoading(true);
    try {
      await markMemberDefaulted(member.id);
      toast.success("Marked as defaulted");
      router.refresh();
    } catch {
      toast.error("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-semibold font-mono">{member.memberId}</h2>
          <p className="text-muted-foreground">{member.customer.name} · {member.customer.phone}</p>
          <p className="text-sm">{member.scheme.schemeName}</p>
        </div>
        <Badge variant={STATUS_VARIANT[member.status]}>{member.status}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 rounded border p-4 text-sm">
        <div>
          <p className="text-muted-foreground">Paid</p>
          <p className="text-lg font-bold">{paidCount} / {member.scheme.durationMonths}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Remaining</p>
          <p className="text-lg font-bold">{remaining}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Total Paid</p>
          <IndianCurrency amount={totalPaid} className="text-lg font-bold" />
        </div>
        <div>
          <p className="text-muted-foreground">Maturity Value</p>
          <IndianCurrency amount={Number(member.totalAmount)} className="text-lg font-bold" />
        </div>
      </div>

      {member.status === "ACTIVE" && !isMature && (
        <div className="flex gap-2">
          <Link href={`/schemes/collect?memberId=${member.id}`}>
            <Button>Collect Instalment</Button>
          </Link>
          <Button variant="outline" onClick={handleDefault} disabled={loading}>
            Mark Defaulted
          </Button>
        </div>
      )}

      {isMature && member.status === "CLOSED" && (
        <div className="rounded border border-green-200 bg-green-50 p-4">
          <p className="font-semibold text-green-800">✓ Scheme Matured</p>
          <p className="text-sm text-green-700 mt-1">
            All {member.scheme.durationMonths} instalments collected. Member can redeem via purchase, cash refund, or gift.
          </p>
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Instalment Status</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Receipt</TableHead>
              <TableHead>Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {instalments.map((inst) => (
              <TableRow key={inst.number} className={!inst.paid && new Date(inst.dueDate) < new Date() ? "bg-red-50" : ""}>
                <TableCell>{inst.number}</TableCell>
                <TableCell>{formatDateDDMMYYYY(inst.dueDate)}</TableCell>
                <TableCell>
                  {inst.paid ? (
                    <Badge variant="default">Paid</Badge>
                  ) : new Date(inst.dueDate) < new Date() ? (
                    <Badge variant="destructive">Overdue</Badge>
                  ) : (
                    <Badge variant="secondary">Pending</Badge>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">
                  {inst.payment?.receiptNumber ?? "—"}
                </TableCell>
                <TableCell>
                  {inst.payment ? (
                    <IndianCurrency amount={Number(inst.payment.amount)} />
                  ) : (
                    <IndianCurrency amount={Number(member.scheme.instalmentAmount)} />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
