import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const rate = await prisma.dailyRate.findFirst({ where: { date: start } }).catch(() => null);

  return (
    <div className="min-h-screen bg-white">
      <Sidebar todaysRate={rate ? Number(rate.gold22kRate) : null} />
      <div className="ml-[240px]">
        <Header userEmail={user?.email ?? "-"} />
        <main className="min-h-[calc(100vh-60px)] bg-white p-6">{children}</main>
      </div>
    </div>
  );
}
