"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReportDateFilterProps {
  dateISO: string;
}

export function ReportDateFilter({ dateISO }: ReportDateFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function applyDate(date: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", date);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem("date") as HTMLInputElement;
        if (input?.value) applyDate(input.value);
      }}
    >
      <div>
        <Label htmlFor="report-date" className="text-xs text-muted-foreground">
          Report Date
        </Label>
        <Input
          id="report-date"
          name="date"
          type="date"
          defaultValue={dateISO}
          className="w-[180px]"
        />
      </div>
      <Button type="submit" variant="outline">
        Go
      </Button>
    </form>
  );
}
