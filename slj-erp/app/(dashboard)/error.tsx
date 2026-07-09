"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[slj-erp] Dashboard error:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-navy">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        The page failed to load. This is usually caused by missing database
        environment variables or tables not created in Supabase.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error reference: {error.digest}
        </p>
      )}
      <ol className="list-decimal space-y-1 pl-5 text-sm">
        <li>
          Add <code>DATABASE_URL</code> and <code>DIRECT_URL</code> in Vercel
        </li>
        <li>Run the SQL migration in Supabase SQL Editor</li>
        <li>Redeploy on Vercel</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.assign("/login")}>
          Back to login
        </Button>
      </div>
    </div>
  );
}
