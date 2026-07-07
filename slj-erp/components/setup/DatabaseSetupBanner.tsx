import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DatabaseSetupBannerProps {
  configError?: string | null;
  queryError?: string | null;
}

export function DatabaseSetupBanner({
  configError,
  queryError,
}: DatabaseSetupBannerProps) {
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
        {error && (
          <pre className="overflow-x-auto rounded-md bg-white/80 p-3 text-xs text-red-800">
            {error}
          </pre>
        )}
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            In Vercel → <strong>slj-erp-01</strong> → Settings → Environment
            Variables, add <code>DATABASE_URL</code> (port 6543, pooler) and{" "}
            <code>DIRECT_URL</code> (port 5432).
          </li>
          <li>
            In Supabase → SQL Editor, run the full migration file{" "}
            <code>supabase/migrations/20260706120000_init.sql</code>.
          </li>
          <li>Redeploy the Vercel project after saving env vars.</li>
        </ol>
        <div className="flex flex-wrap gap-2">
          <Link
            href="https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/sql/new"
            target="_blank"
          >
            <Button size="sm">Open Supabase SQL Editor</Button>
          </Link>
          <Link
            href="https://supabase.com/dashboard/project/dpnkkyzfehjqxlhdgpma/settings/database"
            target="_blank"
          >
            <Button size="sm" variant="outline">
              Get Database URLs
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
