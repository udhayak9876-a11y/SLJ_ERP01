import { ReportsOverview } from "@/components/reports/ReportsOverview";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Compliance & Reports</h2>
        <p className="text-sm text-muted-foreground">
          GST returns, HSN summary, sales registers & daily sales summary
        </p>
      </div>
      <ReportsOverview />
    </div>
  );
}
