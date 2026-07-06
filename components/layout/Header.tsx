"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { todayDisplay } from "@/lib/utils/date";

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
    <header className="fixed left-60 right-0 top-0 z-30 flex h-[60px] items-center justify-between border-b bg-white px-6">
      <span className="font-semibold text-navy">{shopName}</span>
      <span className="text-sm font-medium tabular-nums text-muted-foreground">
        {todayDisplay()}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">{userEmail}</span>
        <Button variant="outline" size="sm" onClick={handleSignOut}>
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </Button>
      </div>
    </header>
  );
}
