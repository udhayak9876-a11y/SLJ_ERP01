import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AccountingOverview() {
  const links = [
    { href: "/accounting/accounts", label: "Chart of Accounts", desc: "Ledger master" },
    { href: "/accounting/journal", label: "Journal Entries", desc: "Auto + manual entries" },
    { href: "/accounting/cash-book", label: "Cash Book", desc: "Daily cash register" },
    { href: "/accounting/bank", label: "Bank Book", desc: "Bank accounts & BRS" },
    { href: "/accounting/trial-balance", label: "Trial Balance", desc: "Period-wise TB" },
    { href: "/accounting/debtors", label: "Debtor Ledger", desc: "Customer outstanding + ageing" },
    { href: "/accounting/creditors", label: "Creditor Ledger", desc: "Supplier payables" },
    { href: "/accounting/vouchers", label: "Vouchers", desc: "Receipt / Payment / Journal" },
    { href: "/accounting/vouchers/new?type=RECEIPT", label: "+ Receipt Voucher", desc: "Money received", highlight: true },
    { href: "/accounting/day-end", label: "Day-End Close", desc: "Lock day & day account" },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {links.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className={`h-full hover:border-gold transition-colors ${item.highlight ? "border-gold" : ""}`}>
            <CardHeader>
              <CardTitle className="text-base">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
