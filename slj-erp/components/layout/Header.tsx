"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatDateDDMMYYYY } from "@/lib/utils/date";

interface HeaderProps {
  userEmail: string;
  shopName: string;
}

export function Header({ userEmail, shopName }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="no-print sticky top-0 z-30 flex h-[60px] items-center justify-between gap-4 border-b bg-white px-4 md:px-6">
      <h1 className="truncate text-base font-semibold text-navy md:text-lg">
        {shopName}
      </h1>
      <p className="hidden shrink-0 text-sm text-muted-foreground sm:block">
        {formatDateDDMMYYYY(new Date())}
      </p>
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <span className="hidden max-w-[160px] truncate text-sm text-muted-foreground md:inline">
          {userEmail}
        </span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
