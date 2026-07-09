import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianCurrency } from "@/components/shared/IndianCurrency";
import { WeightDisplay } from "@/components/shared/WeightDisplay";

interface StockOverviewProps {
  stats: {
    pieces: number;
    weight: number;
    value: number;
    missingHuid: number;
  };
}

export function StockOverview({ stats }: StockOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Pieces
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pieces}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Weight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WeightDisplay weight={stats.weight} className="text-2xl font-bold" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Stock Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IndianCurrency amount={stats.value} className="text-2xl font-bold" />
          </CardContent>
        </Card>
        <Card className={stats.missingHuid > 0 ? "border-red-300" : ""}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Missing HUID
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stats.missingHuid > 0 ? "text-red-600" : ""}`}>
              {stats.missingHuid}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          { href: "/stock/tags", label: "Tag Management", desc: "Create & assign tags" },
          { href: "/stock/lots", label: "Lot Management", desc: "Purchase batches" },
          { href: "/stock/counters", label: "Counters", desc: "Display counters" },
          { href: "/stock/movements", label: "Movement Log", desc: "Audit trail" },
          { href: "/stock/reports/huid", label: "HUID Report", desc: "Hallmark compliance" },
          { href: "/stock/reports/balance", label: "Balance Stock", desc: "By category" },
          { href: "/stock/reports/non-moving", label: "Non-Moving Stock", desc: "Slow movers" },
          { href: "/stock/tags/new", label: "+ New Tag", desc: "Receive stock", highlight: true },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <Card className={`hover:border-gold transition-colors h-full ${item.highlight ? "border-gold" : ""}`}>
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

      {stats.missingHuid > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center justify-between">
          <p className="text-red-700">
            ⚠ {stats.missingHuid} gold piece(s) missing HUID — required before billing
          </p>
          <Link href="/stock/reports/huid">
            <Button variant="outline" size="sm">
              View HUID Report
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
