import { SchemesOverview } from "@/components/schemes/SchemesOverview";

export default function SchemesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Gold Saving Scheme</h2>
        <p className="text-sm text-muted-foreground">
          Chit fund — member enrolment, instalment collection & reminders
        </p>
      </div>
      <SchemesOverview />
    </div>
  );
}
