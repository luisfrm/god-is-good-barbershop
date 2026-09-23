import { NextResponse } from "next/server";
import { getAvailability } from "@/server/services/appointments";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? "14");
    const availability = await getAvailability(
      Number.isFinite(days) && days > 0 ? Math.min(days, 60) : 14
    );
    return NextResponse.json(availability);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load availability" },
      { status: 500 }
    );
  }
}
