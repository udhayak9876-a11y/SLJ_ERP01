import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={cn(
        "h-9 w-full rounded-md border border-slate-300 bg-white px-3 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a2e]",
        props.className,
      )}
    />
  );
}
