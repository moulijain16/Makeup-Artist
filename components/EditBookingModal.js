"use client";

import { useEffect, useState } from "react";
import { FUNCTION_TYPES, LOOK_OPTIONS, minSelectableDate } from "@/lib/validation";

export default function EditBookingModal({ booking, onClose, onSave }) {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    if (booking) {
      setForm({
        name: booking.name,
        phone: booking.phone,
        functionDate: booking.functionDate,
        functionType: booking.functionType,
        functionTypeOther: booking.functionTypeOther || "",
        look: booking.look,
        notes: booking.notes || "",
      });
      setErrors({});
      setServerError("");
    }
  }, [booking]);

  if (!booking || !form) return null;

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  async function handleSave() {
    setSaving(true);
    setServerError("");
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", fields: form }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        else setServerError(data.error || "Could not save changes.");
        return;
      }
      onSave(data.booking);
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink/40 px-4 py-8">
      <div className="w-full max-w-lg rounded-2xl bg-cream p-6 shadow-soft">
        <h2 className="font-display text-xl text-ink">Edit booking</h2>
        <p className="mt-1 text-sm text-ink/60">Update {booking.name}'s request details.</p>

        <div className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Name</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
            />
            {errors.name && <p className="mt-1 text-sm text-rose-dark">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
            />
            {errors.phone && <p className="mt-1 text-sm text-rose-dark">{errors.phone}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Function date</label>
            <input
              type="date"
              min={minSelectableDate()}
              value={form.functionDate}
              onChange={(e) => setField("functionDate", e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
            />
            {errors.functionDate && (
              <p className="mt-1 text-sm text-rose-dark">{errors.functionDate}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Function type</label>
            <select
              value={form.functionType}
              onChange={(e) => setField("functionType", e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
            >
              {FUNCTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {form.functionType === "Other" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-ink/80">Please specify</label>
              <input
                value={form.functionTypeOther}
                onChange={(e) => setField("functionTypeOther", e.target.value)}
                className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
              />
              {errors.functionTypeOther && (
                <p className="mt-1 text-sm text-rose-dark">{errors.functionTypeOther}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Makeup look</label>
            <select
              value={form.look}
              onChange={(e) => setField("look", e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
            >
              {LOOK_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-ink/80">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-rose"
            />
          </div>

          {serverError && <p className="text-sm text-rose-dark">{serverError}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-medium text-ink/70 hover:border-ink/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-cream hover:bg-rose-dark disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
