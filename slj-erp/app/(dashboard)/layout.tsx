import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { DatabaseSetupBanner } from "@/components/setup/DatabaseSetupBanner";
import { getTodayRate } from "@/lib/actions/rates";
import { getShopSettings } from "@/lib/actions/settings";
import { getCurrentUser } from "@/lib/auth";
import { DEFAULT_SHOP_SETTINGS } from "@/lib/db/defaults";
import { getDatabaseConfigError, safeDbCall } from "@/lib/db/safe";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const configError = getDatabaseConfigError();
  const user = await getCurrentUser();

  const [todayRateResult, settingsResult] = await Promise.all([
    safeDbCall("layout.getTodayRate", () => getTodayRate(), null),
    safeDbCall(
      "layout.getShopSettings",
      () => getShopSettings(),
      DEFAULT_SHOP_SETTINGS
    ),
  ]);

  const dbError =
    configError ?? todayRateResult.error ?? settingsResult.error;
  const todayRate = todayRateResult.data;
  const settings = settingsResult.data;

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
        <main className="flex-1 overflow-y-auto p-6">
          {dbError && (
            <div className="mb-6">
              <DatabaseSetupBanner
                configError={configError}
                queryError={
                  !configError
                    ? (todayRateResult.error ?? settingsResult.error)
                    : null
                }
              />
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
