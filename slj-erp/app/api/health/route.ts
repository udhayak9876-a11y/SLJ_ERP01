import { NextResponse } from "next/server";
import { getDatabaseConfigError, safeDbCall } from "@/lib/db/safe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configError = getDatabaseConfigError();

  const shop = await safeDbCall(
    "health.shopSettings",
    () => prisma.shopSettings.findUnique({ where: { id: "singleton" } }),
    null
  );

  const ok = !configError && !shop.error && shop.data !== null;

  return NextResponse.json(
    {
      ok,
      database: {
        configured: !configError,
        configError,
        queryError: shop.error,
        shopSettingsFound: Boolean(shop.data),
      },
    },
    { status: ok ? 200 : 503 }
  );
}
