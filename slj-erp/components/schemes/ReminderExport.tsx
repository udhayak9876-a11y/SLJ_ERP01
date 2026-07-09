"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { buildWhatsAppReminderList } from "@/components/schemes/ChitRemindersWidget";

interface ReminderExportProps {
  reminders: Parameters<typeof buildWhatsAppReminderList>[0];
}

export function ReminderExport({ reminders }: ReminderExportProps) {
  function copyList() {
    const text = buildWhatsAppReminderList(reminders);
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard — paste in WhatsApp");
  }

  function openWhatsApp() {
    const text = encodeURIComponent(buildWhatsAppReminderList(reminders));
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (reminders.length === 0) return null;

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={copyList}>
        Copy List
      </Button>
      <Button size="sm" onClick={openWhatsApp}>
        WhatsApp Share
      </Button>
    </div>
  );
}
