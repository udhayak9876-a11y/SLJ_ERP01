"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  Users,
  Coins,
  ReceiptText,
  ClipboardList,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils/currency";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/items", label: "Items", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/rates", label: "Gold Rates", icon: Coins },
  { href: "/bills/new", label: "New Bill", icon: ReceiptText, highlight: true },
  { href: "/bills", label: "Bills List", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  gold22kRate: number | null;
}

export function Sidebar({ gold22kRate }: SidebarProps) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    if (href === "/bills") return pathname === "/bills" || /^\/bills\/(?!new)/.test(pathname);
    if (href === "/bills/new") return pathname === "/bills/new";
    return pathname.startsWith(href);
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col bg-navy text-white">
      <div className="flex h-[60px] items-center border-b border-white/10 px-4">
        <span className="text-lg font-bold tracking-wide text-gold">SLJ ERP</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon, highlight }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-gold text-navy"
                  : highlight
                    ? "bg-gold/20 text-gold hover:bg-gold hover:text-navy"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs uppercase tracking-wider text-gray-400">
          Today&apos;s 22K Rate
        </p>
        {gold22kRate !== null ? (
          <p className="mt-1 text-2xl font-bold text-gold tabular-nums">
            {formatINR(gold22kRate)}
            <span className="text-sm font-normal text-gray-300">/g</span>
          </p>
        ) : (
          <Link
            href="/rates"
            className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-red-400 hover:text-red-300"
          >
            <AlertTriangle className="h-4 w-4" />
            Rate not set
          </Link>
        )}
      </div>
    </aside>
  );
}
