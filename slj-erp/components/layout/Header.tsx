"use client";

import { createClient } from "@/lib/supabase/client";
import { formatDisplayDate } from "@/lib/utils/date";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function Header({ userEmail }: { userEmail: string }) {
  const supabase = createClient();
  const router = useRouter();

  async function signOut() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="flex h-[60px] items-center justify-between border-b bg-white px-4">
      <div className="font-semibold text-[#1a1a2e]">Sri Lakshmi Jewellery</div>
      <div className="text-sm font-medium">{formatDisplayDate(new Date())}</div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-slate-600">{userEmail}</span>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
