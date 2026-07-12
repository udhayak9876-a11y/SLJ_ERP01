"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ErrorDiagnostics } from "@/components/setup/ErrorDiagnostics";

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
    <div className="mx-auto max-w-2xl space-y-4 rounded-lg border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-navy">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        The page failed to load. Use the diagnostic below to see whether database
        env vars or SQL migrations are the cause.
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">
          Error reference: {error.digest}
        </p>
      )}
      {error.message && error.message !== "An error occurred in the Server Components render." && (
        <pre className="overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-800">
          {error.message}
        </pre>
      )}

      <ErrorDiagnostics />

      <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-950">
        <p className="font-semibold">Quick fix checklist</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Vercel → Settings → Environment Variables: set{" "}
            <code>DATABASE_URL</code> (port <strong>6543</strong>) and{" "}
            <code>DIRECT_URL</code> (port <strong>5432</strong>)
          </li>
          <li>
            Supabase SQL Editor: run all migration files in{" "}
            <code>supabase/migrations/</code> (init → stock → purchase →
            accounting → chit)
          </li>
          <li>Vercel → Deployments → Redeploy</li>
        </ol>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => window.location.assign("/login")}>
          Back to login
        </Button>
      </div>
    </div>
  );
}
