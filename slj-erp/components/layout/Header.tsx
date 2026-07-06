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
    <header className="sticky top-0 z-30 flex h-[60px] items-center justify-between border-b bg-white px-6">
      <h1 className="text-lg font-semibold text-navy">{shopName}</h1>
      <p className="text-sm text-muted-foreground">
        {formatDateDDMMYYYY(new Date())}
      </p>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{userEmail}</span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
