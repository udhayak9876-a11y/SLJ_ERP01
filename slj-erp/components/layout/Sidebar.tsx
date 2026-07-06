"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { formatINR } from "@/lib/utils/currency";

const links = [
  { href: "/", label: "🏠 Dashboard" },
  { href: "/items", label: "📦 Items" },
  { href: "/customers", label: "👥 Customers" },
  { href: "/rates", label: "💰 Gold Rates" },
  { href: "/bills/new", label: "🧾 New Bill", prominent: true },
  { href: "/bills", label: "📋 Bills List" },
  { href: "/settings", label: "⚙️ Settings" },
];

export function Sidebar({ todaysRate }: { todaysRate: number | null }) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 flex h-screen w-[240px] flex-col bg-[#1a1a2e] p-3 text-white">
      <div className="mb-3 border-b border-white/15 pb-3 text-lg font-semibold">SLJ ERP</div>
      <nav className="flex flex-1 flex-col gap-1 text-sm">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2",
                isActive && "bg-white/20",
                !isActive && "hover:bg-white/10",
                link.prominent && "bg-[#d4a017] font-semibold text-black hover:bg-[#d4a017]",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="rounded-md bg-white/10 p-3">
        <p className="text-xs text-slate-200">Today 22K</p>
        {todaysRate === null ? (
          <p className="mt-1 text-base font-semibold text-red-300">⚠ Rate not set</p>
        ) : (
          <p className="mt-1 text-lg font-bold text-[#f8e08d]">{formatINR(todaysRate)}/g</p>
        )}
      </div>
    </aside>
  );
}
