export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import {
  getBookingById,
  confirmBooking,
  declineBooking,
  completeBooking,
  cancelConfirmedBooking,
  deleteBooking,
  updateBooking,
  isDateBlocked,
} from "@/lib/db";
import { validateBookingInput, hasErrors } from "@/lib/validation";
import { getAdminSession } from "@/lib/requireAdmin";

function unauthorized() {
  return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
}

export async function PATCH(request, { params }) {
  const session = getAdminSession();
  if (!session) return unauthorized();

  const { id } = params;
  const booking = getBookingById(id);
  if (!booking) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const body = await request.json().catch(() => ({}));
  const { action } = body;

  if (action === "confirm") {
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only new requests can be confirmed." },
        { status: 400 }
      );
    }
    const updated = confirmBooking(id);
    return NextResponse.json({ booking: updated });
  }

  if (action === "decline") {
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: "Only new requests can be declined." },
        { status: 400 }
      );
    }
    const updated = declineBooking(id);
    return NextResponse.json({ booking: updated });
  }

  if (action === "complete") {
    const updated = completeBooking(id);
    if (!updated) {
      return NextResponse.json(
        { error: "Only confirmed bookings can be marked completed." },
        { status: 400 }
      );
    }
    return NextResponse.json({ booking: updated });
  }

  if (action === "cancel") {
    const updated = cancelConfirmedBooking(id);
    if (!updated) {
      return NextResponse.json(
        { error: "Only confirmed bookings can be cancelled this way." },
        { status: 400 }
      );
    }
    return NextResponse.json({ booking: updated });
  }

  if (action === "edit") {
    const { fields } = body;
    if (!fields) {
      return NextResponse.json({ error: "No fields provided." }, { status: 400 });
    }

    const merged = { ...booking, ...fields };
    const dateUnchanged = merged.functionDate === booking.functionDate;
    const errors = validateBookingInput(merged, { skipDateFutureCheck: dateUnchanged });
    if (hasErrors(errors)) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // If the date is changing (or type/other), make sure it doesn't collide
    // with another confirmed/completed booking.
    if (
      merged.functionDate !== booking.functionDate &&
      isDateBlocked(merged.functionDate, booking.id)
    ) {
      return NextResponse.json(
        {
          errors: {
            functionDate: "That date is already booked by a confirmed bride.",
          },
        },
        { status: 409 }
      );
    }

    const updated = updateBooking(id, {
      name: merged.name.trim(),
      phone: merged.phone.trim(),
      functionDate: merged.functionDate,
      functionType: merged.functionType,
      functionTypeOther:
        merged.functionType === "Other" ? (merged.functionTypeOther || "").trim() : "",
      look: merged.look,
      notes: (merged.notes || "").trim(),
    });
    return NextResponse.json({ booking: updated });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}

export async function DELETE(request, { params }) {
  const session = getAdminSession();
  if (!session) return unauthorized();

  const { id } = params;
  const ok = deleteBooking(id);
  if (!ok) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
