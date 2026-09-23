import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/server/services/auth";
import { listAppointmentsAdmin } from "@/server/services/appointments";
import { appointmentsToCsv } from "@/lib/csv";
import {
  APPOINTMENT_STATUSES,
  type AppointmentStatus,
} from "@/types/scheduling";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.redirect(
      new URL("/panel/login", request.nextUrl.origin)
    );
  }

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status") ?? undefined;
  const status =
    statusParam && APPOINTMENT_STATUSES.includes(statusParam as AppointmentStatus)
      ? (statusParam as AppointmentStatus)
      : undefined;

  const appointments = await listAppointmentsAdmin({
    status,
    date: searchParams.get("date") || undefined,
    query: searchParams.get("q") || undefined,
  });

  // Prepend a UTF-8 BOM so Excel opens accented characters correctly.
  const csv = `\uFEFF${appointmentsToCsv(appointments)}`;
  const filename = `citas-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
