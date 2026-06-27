import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin/access";
import { analyticsToCsv, loadSalonAnalytics, parseAnalyticsRange } from "@/lib/admin/analytics-data";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = await getAdminAccess();
  if (!access?.isSuperAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const range = parseAnalyticsRange(
    searchParams.get("from") ?? undefined,
    searchParams.get("to") ?? undefined,
  );

  const admin = createAdminClient();
  const stats = await loadSalonAnalytics(admin, range);
  const csv = analyticsToCsv(stats);

  const filename = `glam-room-analytics-${range.since.toISOString().slice(0, 10)}-${range.until.toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
