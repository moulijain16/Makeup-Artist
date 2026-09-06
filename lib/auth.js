import crypto from "crypto";

const SECRET = process.env.SESSION_SECRET || "farah-bridal-studio-dev-secret";
const COOKIE_NAME = "farah_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hour session

function sign(value) {
  const hmac = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  return `${value}.${hmac}`;
}

function verify(signed) {
  if (!signed) return null;
  const idx = signed.lastIndexOf(".");
  if (idx === -1) return null;
  const value = signed.slice(0, idx);
  const sig = signed.slice(idx + 1);
  const expected = crypto.createHmac("sha256", SECRET).update(value).digest("hex");
  if (sig.length !== expected.length) return null;
  const ok = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  return ok ? value : null;
}

export function createSessionCookieValue(username) {
  const expires = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${username}|${expires}`;
  return sign(payload);
}

export function readSession(signedValue) {
  const payload = verify(signedValue);
  if (!payload) return null;
  const [username, expiresStr] = payload.split("|");
  const expires = Number(expiresStr);
  if (!expires || Date.now() > expires) return null;
  return { username };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
export const SESSION_MAX_AGE = MAX_AGE_SECONDS;
