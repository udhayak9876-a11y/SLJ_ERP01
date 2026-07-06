import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getShopSettings, getTodayRate } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [settings, todayRate] = await Promise.all([
    getShopSettings(),
    getTodayRate(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="no-print">
        <Sidebar
          gold22kRate={todayRate ? Number(todayRate.gold22kRate) : null}
        />
        <Header userEmail={user.email ?? ""} shopName={settings.shopName} />
      </div>
      <main className="ml-60 min-h-screen bg-white p-6 pt-[84px] print:m-0 print:p-0">
        {children}
      </main>
    </div>
  );
}
