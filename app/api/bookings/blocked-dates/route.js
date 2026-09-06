import { NextResponse } from "next/server";
import { getBlockedDates } from "@/lib/db";

// This reads from a file that changes at runtime (new confirmed bookings),
// so it must never be statically cached at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const dates = getBlockedDates();
  return NextResponse.json({ dates });
}
