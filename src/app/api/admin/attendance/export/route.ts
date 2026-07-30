import { NextResponse } from "next/server";
import { bookingLocationScope, getAdminAccess } from "@/lib/admin/access";
import { loadShiftsInRange, shiftsToCsv, toDateInputValue, weekBounds } from "@/lib/admin/staff-clock";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function isValidDateInput(value: string | null) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export async function GET(request: Request) {
  const access = await getAdminAccess();
  if (!access) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const { start: weekStart, end: weekEnd } = weekBounds();
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");
  const fromDate = isValidDateInput(fromParam) ? fromParam! : toDateInputValue(weekStart);
  const toDate = isValidDateInput(toParam) ? toParam! : toDateInputValue(weekEnd);

  const locationScope = bookingLocationScope(access);
  const admin = createAdminClient();
  const rows = await loadShiftsInRange(admin, locationScope, fromDate, toDate);
  const csv = shiftsToCsv(rows);
  const filename = `glam-room-attendance-${fromDate}-${toDate}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
