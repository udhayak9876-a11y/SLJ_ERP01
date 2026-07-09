"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReportPeriodFilterProps {
  year: number;
  month: number;
  options: { year: number; month: number; label: string }[];
}

export function ReportPeriodFilter({
  year,
  month,
  options,
}: ReportPeriodFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const value = `${year}-${month}`;

  function onChange(next: string) {
    const [y, m] = next.split("-");
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", y);
    params.set("month", m);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-end gap-2">
      <div>
        <Label className="text-xs text-muted-foreground">Report Period</Label>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem
                key={`${opt.year}-${opt.month}`}
                value={`${opt.year}-${opt.month}`}
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
