"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface HealthResponse {
  ok: boolean;
  database?: {
    configured: boolean;
    configError: string | null;
    queryError: string | null;
    shopSettingsFound: boolean;
  };
  migrations?: {
    complete: boolean;
    missing: string[];
    instructions: string[];
  };
}

export function ErrorDiagnostics() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((data: HealthResponse) => setHealth(data))
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Checking database…</p>;
  }

  if (!health) {
    return (
      <p className="text-sm text-muted-foreground">
        Could not reach /api/health — check Vercel deployment and env vars.
      </p>
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-gray-50 p-4 text-sm">
      <p className="font-semibold">Diagnostic (/api/health)</p>
      <ul className="list-disc space-y-1 pl-5">
        <li>
          Database configured:{" "}
          <strong>{health.database?.configured ? "Yes" : "No"}</strong>
        </li>
        <li>
          Shop settings row:{" "}
          <strong>{health.database?.shopSettingsFound ? "Yes" : "No"}</strong>
        </li>
        <li>
          All tables present:{" "}
          <strong>{health.migrations?.complete ? "Yes" : "No"}</strong>
        </li>
      </ul>

      {health.database?.configError && (
        <pre className="overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-800">
          {health.database.configError}
        </pre>
      )}

      {health.database?.queryError && (
        <pre className="overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-800">
          {health.database.queryError}
        </pre>
      )}

      {health.migrations && health.migrations.missing.length > 0 && (
        <div>
          <p className="font-medium text-red-800">Missing tables:</p>
          <p className="text-xs text-red-700">
            {health.migrations.missing.join(", ")}
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs">
            {health.migrations.instructions.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      <Button
        size="sm"
        variant="outline"
        onClick={() => window.open("/api/health", "_blank")}
      >
        Open full health JSON
      </Button>
    </div>
  );
}
