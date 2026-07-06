import { getTodayRate, getRateHistory } from "@/lib/actions/rates";
import { RatesPageClient } from "@/components/rates/RatesPageClient";

export default async function RatesPage() {
  const [todayRate, history] = await Promise.all([
    getTodayRate(),
    getRateHistory(30),
  ]);

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Daily Gold / Silver Rates</h2>
      <RatesPageClient todayRate={todayRate} history={history} />
    </div>
  );
}
