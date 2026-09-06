import { NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "farah_admin_session";

// Lightweight presence check only (edge runtime can't use Node's crypto to
// verify the HMAC signature). Every admin API route independently verifies
// the signed session server-side with lib/requireAdmin, so this is just a
// fast redirect for a good UX — it is not the security boundary.
export function middleware(request) {
  const raw = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!raw) {
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*"],
};
