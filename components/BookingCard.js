"use client";

const STATUS_STYLES = {
  pending: "bg-gold/15 text-gold border-gold/30",
  confirmed: "bg-sage/15 text-sage border-sage/30",
  completed: "bg-ink/10 text-ink/50 border-ink/15",
  cancelled: "bg-rose-light/20 text-rose-dark border-rose-light/40",
};

const STATUS_LABELS = {
  pending: "New",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

function formatDate(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function BookingCard({ booking, onConfirm, onDecline, onComplete, onCancel, onEdit, onDelete }) {
  const isCompleted = booking.status === "completed";
  const functionTypeLabel =
    booking.functionType === "Other" && booking.functionTypeOther
      ? booking.functionTypeOther
      : booking.functionType;

  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-soft transition-opacity",
        isCompleted ? "border-ink/10 bg-ink/5 opacity-60" : "border-ink/10 bg-white/70",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg text-ink">{booking.name}</h3>
          <p className="text-sm text-ink/60">{booking.phone}</p>
        </div>
        <span
          className={[
            "rounded-full border px-3 py-1 text-xs font-medium",
            STATUS_STYLES[booking.status],
          ].join(" ")}
        >
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div>
          <dt className="text-ink/45">Function date</dt>
          <dd className="font-medium text-ink">{formatDate(booking.functionDate)}</dd>
        </div>
        <div>
          <dt className="text-ink/45">Function type</dt>
          <dd className="font-medium text-ink">{functionTypeLabel}</dd>
        </div>
        <div>
          <dt className="text-ink/45">Look</dt>
          <dd className="font-medium text-ink">{booking.look}</dd>
        </div>
        <div>
          <dt className="text-ink/45">Requested</dt>
          <dd className="font-medium text-ink">
            {new Date(booking.createdAt).toLocaleDateString("en-IN")}
          </dd>
        </div>
      </dl>

      {booking.notes && (
        <p className="mt-3 rounded-xl bg-blush/40 px-3 py-2 text-sm text-ink/70">
          {booking.notes}
        </p>
      )}

      {booking.autoCancelled && booking.status === "cancelled" && (
        <p className="mt-2 text-xs text-ink/40">
          Automatically cancelled — this date was confirmed for another bride.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {booking.status === "pending" && (
          <>
            <ActionButton label="Confirm" tone="primary" onClick={() => onConfirm(booking)} />
            <ActionButton label="Decline" tone="ghost" onClick={() => onDecline(booking)} />
          </>
        )}
        {booking.status === "confirmed" && (
          <>
            <ActionButton label="Mark completed" tone="primary" onClick={() => onComplete(booking)} />
            <ActionButton label="Cancel booking" tone="ghost" onClick={() => onCancel(booking)} />
          </>
        )}
         {!isCompleted && (
    <ActionButton label="Edit" tone="ghost" onClick={() => onEdit(booking)} />
  )}
        <ActionButton label="Delete" tone="danger" onClick={() => onDelete(booking)} />
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, tone }) {
  const toneClasses = {
    primary: "bg-rose text-cream hover:bg-rose-dark",
    ghost: "border border-ink/15 text-ink/70 hover:border-ink/30",
    danger: "border border-rose-dark/30 text-rose-dark hover:bg-rose-light/20",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={["rounded-full px-4 py-2 text-xs font-medium transition-colors", toneClasses[tone]].join(" ")}
    >
      {label}
    </button>
  );
}
