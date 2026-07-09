import { AccountingOverview } from "@/components/accounting/AccountingOverview";

export default function AccountingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Accounting & Finance</h2>
        <p className="text-sm text-muted-foreground">
          Ledger, cash book, bank book, trial balance & day-end
        </p>
      </div>
      <AccountingOverview />
    </div>
  );
}
