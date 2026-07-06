import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { getTodayRate } from "@/lib/actions/rates";
import { getShopSettings } from "@/lib/actions/settings";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [todayRate, settings, user] = await Promise.all([
    getTodayRate(),
    getShopSettings(),
    getCurrentUser(),
  ]);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar
        gold22kRate={todayRate ? Number(todayRate.gold22kRate) : null}
      />
      <div className="ml-60 flex min-h-screen flex-col">
        <Header
          shopName={settings.shopName}
          userEmail={user?.email ?? ""}
        />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
