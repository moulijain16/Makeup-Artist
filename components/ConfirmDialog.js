"use client";

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-6 shadow-soft">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        <p className="mt-2 text-sm text-ink/70">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-dark px-5 py-2.5 text-sm font-medium text-cream hover:opacity-90"
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
