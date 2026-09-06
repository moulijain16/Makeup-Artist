export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { verifyAdminCredentials } from "@/lib/db";
import { createSessionCookieValue, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { username, password } = body;

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  const valid = verifyAdminCredentials(username.trim(), password);
  if (!valid) {
    return NextResponse.json(
      { error: "Incorrect username or password." },
      { status: 401 }
    );
  }

  const cookieValue = createSessionCookieValue(username.trim());
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
