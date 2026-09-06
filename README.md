# Bridal Makeup Studio — Booking

A Next.js app for a bridal makeup artist to take booking requests from
brides and manage them from a private admin dashboard.

## Features

**Home page** — studio name, "Book your request" button, "Admin login" button.

**Bride booking form** (`/book`, public, mobile-friendly)
- Fields: name, phone, function type (Mehendi / Haldi / Engagement /
  Reception / Wedding / Party / Other + free text), makeup look (dropdown),
  function date, optional notes.
- All fields mandatory except notes; phone must be a 10-digit number
  starting with 6/7/8/9.
- Function date uses the browser's standard compact date picker. Same-day
  and past dates can't be picked — bookings need at least a day's advance
  notice. If a bride happens to pick today's date, or a date that's already
  confirmed for someone else, she sees an inline warning and has to pick
  another date.
- Submitting with a missing/invalid field blocks submission and shows
  field-level errors.
- On success, shows a simple on-screen "Thank you, we'll get back to you
  soon" message (no data echoed back).
- Duplicate protection: the same bride (name + phone) can't submit the same
  date twice.
- Multiple different brides *can* request the same still-unconfirmed date —
  the admin decides between them from the dashboard.

**Admin dashboard** (`/admin/dashboard`, login-protected)
- Login-only (no sign-up) with a single username/password, logout button.
- Requests sorted with the nearest function date on top; completed bookings
  sink to the bottom and are greyed out.
- Status tabs: All, Confirmed, Completed, Cancelled (with counts), plus a
  "N new requests" badge for pending ones.
- Search by name/phone/function type, filter by date range, and an
  "upcoming only" toggle.
- Actions:
  - **New** request → Confirm or Decline.
  - Confirming one request **automatically cancels** every other pending
    request for the same date.
  - **Confirmed** → Mark completed, or Cancel (this immediately re-opens
    the date for new bookings).
  - **Edit** any field of any request (editing a booking's other details
    without touching its date won't trip the "must be a future date" rule,
    so old/completed records stay editable).
  - **Delete** any request, with a confirmation prompt first.
- Nothing is ever sent to the bride automatically on confirm/decline — the
  admin follows up personally (call/WhatsApp). The only automatic message
  a bride sees is the on-submit thank-you screen.
- All bookings (including old/cancelled ones) are kept permanently for the
  admin's records — nothing is auto-deleted.

## Tech

- Next.js 14 (App Router), React 18, Tailwind CSS.
- Data is stored in a local JSON file (`data/db.json`), created
  automatically on first run — no external database needed.
- Admin session is a signed, HTTP-only cookie; password is hashed with
  bcrypt.

## Getting started

```bash
npm install
npm run dev
```

Visit http://localhost:3000.

Default admin login:
- **Username:** `admin`
- **Password:** `bridal@123`

You can override these before first run (i.e. before `data/db.json` is
created) with environment variables:

```bash
ADMIN_USERNAME=yourname ADMIN_PASSWORD=yourpassword npm run dev
```

To go to production:

```bash
npm run build
npm run start
```

Set a real `SESSION_SECRET` env var in production (used to sign the admin
session cookie):

```bash
SESSION_SECRET=some-long-random-string npm run start
```

## Notes on the data store

`data/db.json` holds the admin credentials and every booking. It's created
automatically the first time the server runs and persists between restarts.
Delete it if you want to start over (it will be recreated with fresh admin
credentials from the env vars above, or the defaults).
