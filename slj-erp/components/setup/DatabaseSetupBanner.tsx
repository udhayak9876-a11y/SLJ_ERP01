import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  buildDatabaseUrlExample,
  getDatabaseConnectionHint,
} from "@/lib/db/validate";

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
  const showPasswordHelp =
    Boolean(connectionHint?.includes("malformed")) ||
    Boolean(error?.includes("invalid port number")) ||
    Boolean(error?.includes("Error parsing connection string"));

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
            <p className="mt-1 whitespace-pre-line">{connectionHint}</p>
          </div>
        )}

        {error && (
          <pre className="overflow-x-auto rounded-md bg-white/80 p-3 text-xs text-red-800">
            {error}
          </pre>
        )}

        {showPasswordHelp && (
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-blue-950">
            <p className="font-semibold">Password special characters</p>
            <p className="mt-1">
              If your Supabase database password contains{" "}
              <code>@ # % : / ? &</code>, you must URL-encode{" "}
              <strong>only the password</strong> before pasting into Vercel.
            </p>
            <p className="mt-2">
              Example: <code>P@ss#1</code> → <code>P%40ss%231</code>
            </p>
            <p className="mt-2 text-xs">
              In browser console:{" "}
              <code>encodeURIComponent(&quot;your-password&quot;)</code>
            </p>
          </div>
        )}

        <div className="rounded-md bg-white/80 p-3">
          <p className="font-semibold">Correct Vercel env vars</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <code>DATABASE_URL</code> → Transaction pooler, port{" "}
              <strong>6543</strong>
            </li>
            <li>
              <code>DIRECT_URL</code> → Session pooler, port <strong>5432</strong>
            </li>
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Example shape (replace password and region):
          </p>
          <pre className="mt-1 overflow-x-auto rounded bg-gray-100 p-2 text-xs">
            {buildDatabaseUrlExample()}
          </pre>
          <p className="mt-2 text-xs">
            If Supabase URI already contains <code>?sslmode=require</code>, append{" "}
            <code>&amp;pgbouncer=true&amp;connection_limit=1</code> — do not add a
            second <code>?</code>.
          </p>
        </div>

        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Supabase → Database → Connection string → <strong>URI</strong>
          </li>
          <li>
            Transaction (6543) → Vercel <code>DATABASE_URL</code>
          </li>
          <li>
            Session (5432) → Vercel <code>DIRECT_URL</code>
          </li>
          <li>Replace password; encode special characters if needed</li>
          <li>Redeploy on Vercel</li>
        </ol>

        <div className="flex flex-wrap gap-2">
          <Link
            href="https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database"
            target="_blank"
          >
            <Button size="sm">Open Database Settings</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
