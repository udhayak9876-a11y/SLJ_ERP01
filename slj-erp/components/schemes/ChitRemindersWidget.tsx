import Link from "next/link";
import { formatDateDDMMYYYY } from "@/lib/utils/date";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
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

interface Reminder {
  member: {
    id: string;
    memberId: string;
    customer: { name: string; phone: string };
    scheme: { schemeName: string };
  };
  nextInstalment: number;
  dueDate: Date;
  daysUntilDue: number;
  amount: number;
}

interface ChitRemindersWidgetProps {
  reminders: Reminder[];
  compact?: boolean;
}

export function ChitRemindersWidget({ reminders, compact }: ChitRemindersWidgetProps) {
  const display = compact ? reminders.slice(0, 5) : reminders;

  if (display.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No instalments due in the next 7 days
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Inst.</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Amount</TableHead>
            {!compact && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {display.map((r) => (
            <TableRow key={r.member.id} className={r.daysUntilDue < 0 ? "bg-red-50" : ""}>
              <TableCell className="font-mono text-xs">{r.member.memberId}</TableCell>
              <TableCell>
                <div>{r.member.customer.name}</div>
                <div className="text-xs text-muted-foreground">{r.member.customer.phone}</div>
              </TableCell>
              <TableCell>#{r.nextInstalment}</TableCell>
              <TableCell>
                {formatDateDDMMYYYY(r.dueDate)}
                {r.daysUntilDue < 0 ? (
                  <Badge variant="destructive" className="ml-1 text-xs">Overdue</Badge>
                ) : r.daysUntilDue <= 7 ? (
                  <span className="text-xs text-amber-600 ml-1">{r.daysUntilDue}d</span>
                ) : null}
              </TableCell>
              <TableCell><IndianCurrency amount={r.amount} /></TableCell>
              {!compact && (
                <TableCell>
                  <Link href={`/schemes/collect?memberId=${r.member.id}`}>
                    <Button size="sm" variant="outline">Collect</Button>
                  </Link>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {compact && reminders.length > 5 && (
        <Link href="/schemes/reminders" className="text-sm text-gold hover:underline">
          View all {reminders.length} reminders →
        </Link>
      )}
    </div>
  );
}

export function buildWhatsAppReminderList(
  reminders: Reminder[]
): string {
  const lines = reminders.map(
    (r) =>
      `${r.member.customer.name} (${r.member.customer.phone}) — ${r.member.scheme.schemeName} Inst.#${r.nextInstalment} ₹${r.amount} due ${formatDateDDMMYYYY(r.dueDate)}`
  );
  return `Sri Lakshmi Jewellery — Chit Reminders\n\n${lines.join("\n")}`;
}
