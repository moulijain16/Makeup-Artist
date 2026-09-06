export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/auth";

export async function GET() {
  const cookieStore = cookies();
  const session = readSession(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, username: session.username });
}
