import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", className)}>
      {children}
    </span>
  );
}
