import * as React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "destructive" | "ghost";
}

export function Button({ className, variant = "default", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-60",
        variant === "default" && "bg-[#1a1a2e] text-white hover:bg-[#131321]",
        variant === "outline" && "border border-slate-300 bg-white text-slate-900 hover:bg-slate-100",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "bg-transparent hover:bg-slate-100",
        className,
      )}
      {...props}
    />
  );
}
