import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportsOverview() {
  const links = [
    {
      href: "/reports/gstr-1",
      label: "GSTR-1",
      desc: "Outward supplies — B2B & B2C for GST filing",
    },
    {
      href: "/reports/gstr-3b",
      label: "GSTR-3B Summary",
      desc: "Monthly tax liability summary",
    },
    {
      href: "/reports/hsn",
      label: "HSN Summary",
      desc: "HSN-wise taxable value & tax breakup",
    },
    {
      href: "/reports/sales-register",
      label: "B2B / B2C Register",
      desc: "Sales register with GSTIN classification",
    },
    {
      href: "/reports/daily-sales",
      label: "Daily Sales Summary",
      desc: "Legacy day-end format — sales, old gold, chit, payments",
      highlight: true,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {links.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card
            className={`h-full transition-colors hover:border-gold ${
              item.highlight ? "border-gold" : ""
            }`}
          >
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
