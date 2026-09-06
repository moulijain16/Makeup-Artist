export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  createBooking,
  getAllBookings,
  hasDuplicateRequest,
  isDateBlocked,
} from "@/lib/db";
import { validateBookingInput, hasErrors } from "@/lib/validation";
import { getAdminSession } from "@/lib/requireAdmin";

// GET /api/bookings — admin only. Returns every booking, sorted so the
// nearest upcoming function date is on top and completed bookings sink to
// the bottom (still visible, just deprioritised).
export async function GET() {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const bookings = getAllBookings();

  const sorted = [...bookings].sort((a, b) => {
    // Completed bookings always sink to the bottom.
    const aCompleted = a.status === "completed" ? 1 : 0;
    const bCompleted = b.status === "completed" ? 1 : 0;
    if (aCompleted !== bCompleted) return aCompleted - bCompleted;

    // Otherwise sort by nearest function date first.
    if (a.functionDate !== b.functionDate) {
      return a.functionDate < b.functionDate ? -1 : 1;
    }
    // Tie-break: newest request first.
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return NextResponse.json({ bookings: sorted });
}

// POST /api/bookings — public. A bride submits a new booking request.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  const errors = validateBookingInput(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ errors }, { status: 400 });
  }

  const { name, phone, functionDate } = body;

  if (isDateBlocked(functionDate)) {
    return NextResponse.json(
      {
        errors: {
          functionDate:
            "That date is already booked. Please choose another date.",
        },
      },
      { status: 409 }
    );
  }

  if (hasDuplicateRequest(phone, functionDate)) {
    return NextResponse.json(
      {
        errors: {
          functionDate:
            "You have already sent a request for this date. One request is enough — we'll get back to you soon.",
        },
      },
      { status: 409 }
    );
  }

  const booking = createBooking(body);
  return NextResponse.json({ booking }, { status: 201 });
}
