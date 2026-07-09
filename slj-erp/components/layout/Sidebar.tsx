"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatINR } from "@/lib/utils/currency";

const navItems = [
  { href: "/", label: "Dashboard", icon: "🏠" },
  { href: "/items", label: "Items", icon: "📦" },
  { href: "/customers", label: "Customers", icon: "👥" },
  { href: "/stock", label: "Stock", icon: "🏷️" },
  { href: "/purchase", label: "Purchase", icon: "📥" },
  { href: "/accounting", label: "Accounts", icon: "📊" },
  { href: "/schemes", label: "Schemes", icon: "🪙" },
  { href: "/reports", label: "Reports", icon: "📈" },
  { href: "/rates", label: "Gold Rates", icon: "💰" },
  { href: "/bills/new", label: "New Bill", icon: "🧾", highlight: true },
  { href: "/bills", label: "Bills List", icon: "📋" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

interface SidebarProps {
  gold22kRate: number | null;
}

export function Sidebar({ gold22kRate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-60 flex-col bg-navy text-white">
      <div className="border-b border-white/10 p-4">
        <h2 className="text-sm font-bold leading-tight">Sri Lakshmi</h2>
        <p className="text-xs text-white/70">Jewellery ERP</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "mb-1 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                item.highlight && "font-semibold",
                isActive
                  ? "bg-gold text-white"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
                item.highlight && !isActive && "border border-gold/50"
              )}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-white/60">Today&apos;s 22K Rate</p>
        {gold22kRate !== null ? (
          <p className="text-xl font-bold text-gold">
            {formatINR(gold22kRate)}
            <span className="text-sm font-normal text-white/70">/g</span>
          </p>
        ) : (
          <p className="text-sm font-semibold text-red-400">⚠ Rate not set</p>
        )}
      </div>
    </aside>
  );
}
