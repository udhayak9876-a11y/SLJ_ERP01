import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="text-4xl font-bold text-gold">404</p>
      <h2 className="mt-2 text-lg font-semibold">Page not found</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        This record or page could not be found in Sri Lakshmi Jewellery ERP.
      </p>
      <div className="mt-6 flex gap-2">
        <Link href="/">
          <Button>Dashboard</Button>
        </Link>
        <Link href="/bills">
          <Button variant="outline">Bills</Button>
        </Link>
      </div>
    </div>
  );
}
