import { cn } from "@/lib/utils/cn";

export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return <table className={cn("w-full border-collapse text-sm", className)} {...props} />;
}

export function Th({ className, ...props }: React.ComponentProps<"th">) {
  return <th className={cn("border-b px-2 py-2 text-left font-semibold", className)} {...props} />;
}

export function Td({ className, ...props }: React.ComponentProps<"td">) {
  return <td className={cn("border-b px-2 py-2 align-top", className)} {...props} />;
}
