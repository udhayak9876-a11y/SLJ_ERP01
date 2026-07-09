export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-7 w-32 rounded bg-muted" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg border bg-muted/40" />
        ))}
      </div>
      <div className="h-16 rounded-lg border bg-muted/40" />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-lg border bg-muted/40" />
        <div className="h-64 rounded-lg border bg-muted/40" />
      </div>
    </div>
  );
}
