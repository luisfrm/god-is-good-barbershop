import { NextResponse } from "next/server";
import { createBooking } from "@/server/services/appointments";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const result = await createBooking({
      name: String(body.name ?? ""),
      email: String(body.email ?? ""),
      phone: String(body.phone ?? ""),
      message: body.message ? String(body.message) : undefined,
      date: String(body.date ?? ""),
      start_time: String(body.start_time ?? ""),
      end_time: String(body.end_time ?? ""),
      timezone: String(body.timezone ?? "America/Caracas"),
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ appointment: result.appointment }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create appointment" },
      { status: 500 }
    );
  }
}
