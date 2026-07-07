import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDatabaseConnectionHint } from "@/lib/db/validate";

interface DatabaseSetupBannerProps {
  configError?: string | null;
  queryError?: string | null;
}

export function DatabaseSetupBanner({
  configError,
  queryError,
}: DatabaseSetupBannerProps) {
  const connectionHint = getDatabaseConnectionHint(queryError);
  const error = configError ?? queryError;

  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-lg text-amber-900">
          Database setup required
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-amber-950">
        <p>
          Login succeeded, but the dashboard cannot load data from Supabase
          PostgreSQL yet.
        </p>

        {connectionHint && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-900">
            <p className="font-semibold">Likely fix</p>
            <p className="mt-1">{connectionHint}</p>
          </div>
        )}

        {error && (
          <pre className="overflow-x-auto rounded-md bg-white/80 p-3 text-xs text-red-800">
            {error}
          </pre>
        )}

        <div className="rounded-md bg-white/80 p-3">
          <p className="font-semibold">Correct Vercel env vars</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <code>DATABASE_URL</code> → Supabase <strong>Transaction</strong>{" "}
              mode, host <code>*.pooler.supabase.com</code>, port{" "}
              <strong>6543</strong>, suffix{" "}
              <code>?pgbouncer=true&amp;connection_limit=1</code>
            </li>
            <li>
              <code>DIRECT_URL</code> → Supabase <strong>Session</strong> mode,
              port <strong>5432</strong> (used for migrations only)
            </li>
          </ul>
        </div>

        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Supabase → Project Settings → Database → Connection string → choose{" "}
            <strong>URI</strong>
          </li>
          <li>
            Copy <strong>Transaction</strong> (6543) into Vercel{" "}
            <code>DATABASE_URL</code>
          </li>
          <li>
            Copy <strong>Session</strong> (5432) into Vercel{" "}
            <code>DIRECT_URL</code>
          </li>
          <li>
            Replace <code>[YOUR-PASSWORD]</code> with your real database password
          </li>
          <li>
            Redeploy on Vercel (Deployments → ⋯ → Redeploy)
          </li>
        </ol>

        <div className="flex flex-wrap gap-2">
          <Link
            href="https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database"
            target="_blank"
          >
            <Button size="sm">Open Database Settings</Button>
          </Link>
          <Link
            href="https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new"
            target="_blank"
          >
            <Button size="sm" variant="outline">
              SQL Editor (repair script)
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
