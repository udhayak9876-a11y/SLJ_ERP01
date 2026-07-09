import Link from "next/link";
import { getChitReminders, getOverdueReminders } from "@/lib/actions/chitMembers";
import { ChitRemindersWidget } from "@/components/schemes/ChitRemindersWidget";
import { ReminderExport } from "@/components/schemes/ReminderExport";

export default async function RemindersPage() {
  const [dueSoon, overdue] = await Promise.all([
    getChitReminders(7),
    getOverdueReminders(),
  ]);

  const all = [...overdue, ...dueSoon.filter((d) => !overdue.some((o) => o.member.id === d.member.id))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/schemes" className="text-sm text-muted-foreground hover:underline">← Schemes</Link>
          <h2 className="text-xl font-semibold mt-1">Chit Reminders</h2>
          <p className="text-sm text-muted-foreground">
            Instalments due within 7 days · {overdue.length} overdue
          </p>
        </div>
        <ReminderExport reminders={all} />
      </div>

      {overdue.length > 0 && (
        <div>
          <h3 className="font-medium text-red-700 mb-2">Overdue ({overdue.length})</h3>
          <ChitRemindersWidget reminders={overdue} />
        </div>
      )}

      <div>
        <h3 className="font-medium mb-2">Due Soon ({dueSoon.length})</h3>
        <ChitRemindersWidget reminders={dueSoon} />
      </div>
    </div>
  );
}
