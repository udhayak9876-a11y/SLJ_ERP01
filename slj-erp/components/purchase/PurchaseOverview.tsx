import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PurchaseOverview() {
  const links = [
    { href: "/purchase/bills/new", label: "New Purchase Bill", desc: "From supplier/dealer", highlight: true },
    { href: "/purchase/bills", label: "Purchase Bills", desc: "View all purchases" },
    { href: "/purchase/old-metal/new", label: "Old Gold Buyback", desc: "Purchase from customer" },
    { href: "/purchase/old-metal", label: "Buyback Register", desc: "Old metal vouchers" },
    { href: "/purchase/returns/new", label: "Purchase Return", desc: "Return to dealer" },
    { href: "/purchase/returns", label: "Return Register", desc: "All returns" },
    { href: "/purchase/suppliers", label: "Suppliers", desc: "Dealer master" },
    { href: "/purchase/reports", label: "Reports", desc: "Purchase register" },
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
