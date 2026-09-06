import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const initial = {
      admin: {
        username: adminUsername,
        passwordHash: bcrypt.hashSync(adminPassword, 10),
      },
      bookings: [],
      nextId: 1,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
  }
}

function readDb() {
  ensureDb();
  const raw = fs.readFileSync(DB_FILE, "utf-8");
  return JSON.parse(raw);
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ---------- Admin ----------
export function getAdmin() {
  return readDb().admin;
}

export function verifyAdminCredentials(username, password) {
  const admin = getAdmin();
  if (!admin) return false;
  if (admin.username !== username) return false;
  return bcrypt.compareSync(password, admin.passwordHash);
}

// ---------- Bookings ----------
// Booking shape:
// {
//   id, name, phone, functionDate (YYYY-MM-DD), functionType, functionTypeOther,
//   look, notes, status: 'pending' | 'confirmed' | 'completed' | 'cancelled',
//   createdAt, updatedAt
// }

export function getAllBookings() {
  return readDb().bookings;
}

export function getBookingById(id) {
  const db = readDb();
  return db.bookings.find((b) => b.id === Number(id));
}

// A date is "blocked" for new requests if there's a CONFIRMED (or completed)
// booking on that date. Completed bookings are past events but we still keep
// the date logically blocked since it means a wedding happened there.
export function isDateBlocked(dateStr, excludeId) {
  const db = readDb();
  return db.bookings.some(
    (b) =>
      b.functionDate === dateStr &&
      (b.status === "confirmed" || b.status === "completed") &&
      b.id !== Number(excludeId || -1)
  );
}

export function getBlockedDates() {
  const db = readDb();
  const dates = db.bookings
    .filter((b) => b.status === "confirmed" || b.status === "completed")
    .map((b) => b.functionDate);
  return Array.from(new Set(dates));
}

export function hasDuplicateRequest(phone, dateStr) {
  const db = readDb();

  return db.bookings.some(
    (b) =>
      b.phone === phone &&
      b.functionDate === dateStr &&
      b.status !== "cancelled"
  );
}

export function createBooking(input) {
  const db = readDb();
  const now = new Date().toISOString();
  const booking = {
    id: db.nextId,
    name: input.name.trim(),
    phone: input.phone.trim(),
    functionDate: input.functionDate,
    functionType: input.functionType,
    functionTypeOther: input.functionType === "Other" ? (input.functionTypeOther || "").trim() : "",
    look: input.look,
    notes: (input.notes || "").trim(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
  db.bookings.push(booking);
  db.nextId += 1;
  writeDb(db);
  return booking;
}

export function updateBooking(id, fields) {
  const db = readDb();
  const idx = db.bookings.findIndex((b) => b.id === Number(id));
  if (idx === -1) return null;
  db.bookings[idx] = {
    ...db.bookings[idx],
    ...fields,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return db.bookings[idx];
}

export function deleteBooking(id) {
  const db = readDb();
  const before = db.bookings.length;
  db.bookings = db.bookings.filter((b) => b.id !== Number(id));
  writeDb(db);
  return db.bookings.length < before;
}

// Confirm a booking: sets it confirmed, auto-cancels every other pending
// request for the same date.
export function confirmBooking(id) {
  const db = readDb();
  const target = db.bookings.find((b) => b.id === Number(id));
  if (!target) return null;
  if (target.status !== "pending") return target;

  target.status = "confirmed";
  target.updatedAt = new Date().toISOString();

  db.bookings.forEach((b) => {
    if (
      b.id !== target.id &&
      b.functionDate === target.functionDate &&
      b.status === "pending"
    ) {
      b.status = "cancelled";
      b.updatedAt = new Date().toISOString();
      b.autoCancelled = true;
    }
  });

  writeDb(db);
  return target;
}

export function declineBooking(id) {
  return updateBooking(id, { status: "cancelled" });
}

export function completeBooking(id) {
  const booking = getBookingById(id);
  if (!booking || booking.status !== "confirmed") return null;
  return updateBooking(id, { status: "completed" });
}

// Admin cancelling a confirmed booking reopens the date automatically
// (reopening just means no other confirmed booking exists for that date,
// which is naturally true once this record's status changes away from
// 'confirmed').
export function cancelConfirmedBooking(id) {
  const booking = getBookingById(id);
  if (!booking) return null;
  if (booking.status !== "confirmed") return null;
  return updateBooking(id, { status: "cancelled" });
}
