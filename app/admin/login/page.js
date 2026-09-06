"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/admin/dashboard");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="text-xs tracking-wide text-rose-dark/70">Bridal Makeup Studio</p>
          <h1 className="font-display mt-1 text-3xl text-ink">Admin login</h1>
          <p className="mt-2 text-sm text-ink/60">Sign in to view your booking requests.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-ink/10 bg-white/60 p-6 shadow-soft"
        >
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Username</label>
            <input
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-rose"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink/80">Password</label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-rose"
            />
          </div>

          {error && <p className="text-sm text-rose-dark">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-rose px-6 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-rose-dark disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Log in"}
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
