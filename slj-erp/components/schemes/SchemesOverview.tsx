import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SchemesOverview() {
  const links = [
    { href: "/schemes/list", label: "Scheme Master", desc: "Create & manage schemes" },
    { href: "/schemes/members/new", label: "Enrol Member", desc: "Add customer to scheme", highlight: true },
    { href: "/schemes/collect", label: "Collect Instalment", desc: "Record payment" },
    { href: "/schemes/members", label: "All Members", desc: "Member list & status" },
    { href: "/schemes/reminders", label: "Reminders", desc: "Due in 7 days + overdue" },
    { href: "/schemes/reports", label: "Reports", desc: "Collection by date/mode/scheme" },
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
