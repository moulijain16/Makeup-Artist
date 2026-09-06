import { cookies } from "next/headers";
import { readSession, SESSION_COOKIE_NAME } from "@/lib/auth";

// Returns the session object if the request carries a valid admin session,
// or null otherwise. Callers should return a 401 when this is null.
export function getAdminSession() {
  const cookieStore = cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return readSession(raw);
}
