import { NextResponse } from "next/server";
import { getDatabaseConfigError, safeDbCall } from "@/lib/db/safe";
import {
  checkMigrationStatus,
  migrationInstructions,
} from "@/lib/db/migrationCheck";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const configError = getDatabaseConfigError();

  const shop = await safeDbCall(
    "health.shopSettings",
    () => prisma.shopSettings.findUnique({ where: { id: "singleton" } }),
    null
  );

  const migrations = configError
    ? { complete: false, existing: [] as string[], missing: [] as string[] }
    : await checkMigrationStatus();

  const ok =
    !configError &&
    !shop.error &&
    shop.data !== null &&
    migrations.complete;

  return NextResponse.json(
    {
      ok,
      database: {
        configured: !configError,
        configError,
        queryError: shop.error,
        shopSettingsFound: Boolean(shop.data),
      },
      migrations: {
        complete: migrations.complete,
        missing: migrations.missing,
        existingCount: migrations.existing.length,
        instructions: migrationInstructions(migrations.missing),
      },
    },
    { status: ok ? 200 : 503 }
  );
}
