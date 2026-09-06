"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  FUNCTION_TYPES,
  LOOK_OPTIONS,
  validateBookingInput,
  hasErrors,
  minSelectableDate,
  todayStr,
} from "@/lib/validation";

const initialForm = {
  name: "",
  phone: "",
  functionDate: "",
  functionType: "",
  functionTypeOther: "",
  look: "",
  notes: "",
};

export default function BookPage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [blockedDates, setBlockedDates] = useState([]);
  const [dateWarning, setDateWarning] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState("");

  useEffect(() => {
    fetch("/api/bookings/blocked-dates")
      .then((r) => r.json())
      .then((data) => setBlockedDates(data.dates || []))
      .catch(() => {});
  }, []);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError("");
    setDateWarning("");

    const clientErrors = validateBookingInput(form);
    if (hasErrors(clientErrors)) {
      setErrors(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setServerError(data.error || "Something went wrong. Please try again.");
        }
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 py-16">
        <div className="w-full max-w-md rounded-2xl border border-ink/10 bg-white/70 p-8 text-center shadow-soft">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage/15 text-sage">
            ✓
          </div>
          <h1 className="font-display text-2xl text-ink">Thank you!</h1>
          <p className="mt-3 text-ink/70">
            Your booking request has been received. We'll get back to you
            soon.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full border border-ink/15 px-6 py-3 text-sm font-medium text-ink/70 hover:border-ink/30 hover:text-ink"
          >
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-6 text-center">
          <p className="text-xs tracking-wide text-rose-dark/70">Bridal Makeup Studio</p>
          <h1 className="font-display mt-1 text-3xl text-ink">Request a booking</h1>
          <p className="mt-2 text-sm text-ink/60">
            Share your details below and we'll confirm your date.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-ink/10 bg-white/60 p-5 shadow-soft sm:p-7"
          noValidate
        >
          <Field label="Your name" required error={errors.name}>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              className={inputClass(errors.name)}
              placeholder="e.g. Priya Sharma"
            />
          </Field>

          <Field label="Phone number" required error={errors.phone}>
            <input
              type="tel"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={inputClass(errors.phone)}
              placeholder="10-digit mobile number"
            />
          </Field>

          <Field label="Function type" required error={errors.functionType}>
            <select
              value={form.functionType}
              onChange={(e) => setField("functionType", e.target.value)}
              className={inputClass(errors.functionType)}
            >
              <option value="">Select function type</option>
              {FUNCTION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>

          {form.functionType === "Other" && (
            <Field label="Please specify" required error={errors.functionTypeOther}>
              <input
                type="text"
                value={form.functionTypeOther}
                onChange={(e) => setField("functionTypeOther", e.target.value)}
                className={inputClass(errors.functionTypeOther)}
                placeholder="Tell us the occasion"
              />
            </Field>
          )}

          <Field label="Makeup look" required error={errors.look}>
            <select
              value={form.look}
              onChange={(e) => setField("look", e.target.value)}
              className={inputClass(errors.look)}
            >
              <option value="">Select the look you want</option>
              {LOOK_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Function date" required error={errors.functionDate}>
            <input
              type="date"
              min={minSelectableDate()}
              value={form.functionDate}
              onChange={(e) => {
                const picked = e.target.value;
                setDateWarning("");

                if (!picked) {
                  setField("functionDate", "");
                  return;
                }

                if (picked <= todayStr()) {
                  setDateWarning("Please book at least a day in advance.");
                  setField("functionDate", "");
                  return;
                }

                if (blockedDates.includes(picked)) {
                  setDateWarning("That date is already booked. Please choose another date.");
                  setField("functionDate", "");
                  return;
                }

                setField("functionDate", picked);
              }}
              className={inputClass(errors.functionDate)}
            />
            {dateWarning && <p className="mt-2 text-sm text-rose-dark">{dateWarning}</p>}
          </Field>

          <Field label="Additional notes (optional)">
            <textarea
              value={form.notes}
              onChange={(e) => setField("notes", e.target.value)}
              rows={3}
              className={inputClass(false)}
              placeholder="Sensitive skin, a particular style, anything else we should know"
            />
          </Field>

          {serverError && <p className="text-sm text-rose-dark">{serverError}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-rose px-6 py-4 text-base font-medium text-cream shadow-soft transition-colors hover:bg-rose-dark disabled:opacity-60"
          >
            {submitting ? "Sending request…" : "Send booking request"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-ink/50 hover:text-ink/80">
            ← Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink/80">
        {label}
        {required && <span className="text-rose-dark"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-rose-dark">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return [
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink outline-none transition-colors",
    "focus:border-rose",
    hasError ? "border-rose-dark/60" : "border-ink/15",
  ].join(" ");
}
