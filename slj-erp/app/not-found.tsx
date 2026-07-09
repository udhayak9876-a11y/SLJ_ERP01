import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md space-y-4 rounded-lg border bg-white p-8 text-center shadow-sm">
        <p className="text-5xl font-bold text-gold">404</p>
        <h2 className="text-xl font-semibold text-navy">Page not found</h2>
        <p className="text-sm text-muted-foreground">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link href="/">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
