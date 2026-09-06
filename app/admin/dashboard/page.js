"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookingCard from "@/components/BookingCard";
import EditBookingModal from "@/components/EditBookingModal";
import ConfirmDialog from "@/components/ConfirmDialog";

const TABS = [
  { key: "all", label: "All" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function formatDateForSearch(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr + "T00:00:00");
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [editingBooking, setEditingBooking] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banner, setBanner] = useState("");

  async function loadBookings() {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      setBookings(data.bookings || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  async function performAction(booking, action) {
    const res = await fetch(`/api/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json();
    if (!res.ok) {
      setBanner(data.error || "Could not update the booking.");
      return;
    }
    await loadBookings();
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return;
    const res = await fetch(`/api/bookings/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  }

  const newCount = bookings.filter((b) => b.status === "pending").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return bookings.filter((b) => {
      if (tab !== "all" && b.status !== tab) return false;

      if (q) {
        const typeLabel =
          b.functionType === "Other" ? b.functionTypeOther : b.functionType;
        const formattedDate = formatDateForSearch(b.functionDate);
        const haystack = `${b.name} ${b.phone} ${typeLabel} ${b.functionDate || ""} ${formattedDate}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      return true;
    });
  }, [bookings, tab, search]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-4xl">

<header className="flex items-center justify-between gap-2 sm:gap-4">
  <div className="min-w-0 flex-1">
    <p className="text-xs tracking-wide text-rose-dark/70 truncate">Bridal Makeup Studio</p>
    <h1 className="font-display text-xl sm:text-3xl text-ink whitespace-nowrap">
      Booking requests
    </h1>
  </div>

  <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
    {newCount > 0 && (
      <span className="rounded-full bg-rose px-2.5 py-1 text-[11px] sm:text-xs font-medium text-cream whitespace-nowrap">
        {newCount} new request{newCount > 1 ? "s" : ""}
      </span>
    )}
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-full border border-ink/15 px-3 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm font-medium text-ink/70 hover:border-ink/30 whitespace-nowrap"
    >
      Logout
    </button>
  </div>
</header>

        <div className="mt-6 flex overflow-x-auto whitespace-nowrap gap-2 pb-1 scrollbar-none">
          {TABS.map((t) => {
            const count =
              t.key === "all" ? bookings.length : bookings.filter((b) => b.status === t.key).length;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={[
                  "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active ? "bg-rose text-cream" : "border border-ink/15 text-ink/70 hover:border-ink/30",
                ].join(" ")}
              >
                {t.label} ({count})
              </button>
            );
          })}
        </div>

<div className="mt-5">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search name, phone, date or type…"
    className="w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-rose shadow-sm"
  />
</div>

        {banner && (
          <div className="mt-4 rounded-xl bg-rose-light/20 px-4 py-3 text-sm text-rose-dark">
            {banner}
            <button className="ml-3 underline" onClick={() => setBanner("")}>
              dismiss
            </button>
          </div>
        )}

        <div className="mt-6 space-y-4">
          {loading && <p className="text-sm text-ink/50">Loading requests…</p>}

          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-ink/15 p-10 text-center text-sm text-ink/50">
              No booking requests match here.
            </div>
          )}

          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onConfirm={(b) => performAction(b, "confirm")}
              onDecline={(b) => performAction(b, "decline")}
              onComplete={(b) => performAction(b, "complete")}
              onCancel={(b) => performAction(b, "cancel")}
              onEdit={(b) => setEditingBooking(b)}
              onDelete={(b) => setDeleteTarget(b)}
            />
          ))}
        </div>
      </div>

      <EditBookingModal
        booking={editingBooking}
        onClose={() => setEditingBooking(null)}
        onSave={() => {
          setEditingBooking(null);
          loadBookings();
        }}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this request?"
        message={
          deleteTarget
            ? `Are you sure you want to delete ${deleteTarget.name}'s request? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirmed}
        onCancel={() => setDeleteTarget(null)}
      />
    </main>
  );
}