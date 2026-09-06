import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* soft decorative background blooms */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blush/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold/20 blur-3xl"
      />

      <div className="relative w-full max-w-md rounded-2xl border border-ink/10 bg-white/60 px-8 py-10 text-center shadow-soft">
       <h1 className="font-display text-3xl font-semibold tracking-tight text-rose-dark">
          Bridal Makeup Studio
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Makeup that feels as beautiful as your day.
        </p>

        <div className="mt-8 h-px w-full bg-ink/10" />

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/book"
            className="whitespace-nowrap rounded-full bg-rose px-6 py-4 text-base font-medium text-cream shadow-soft transition-colors hover:bg-rose-dark"
          >
            Book your request
          </Link>
          <Link
            href="/admin/login"
            className="whitespace-nowrap rounded-full border border-ink/15 bg-transparent px-6 py-4 text-base font-medium text-ink/70 transition-colors hover:border-ink/30 hover:text-ink"
          >
            Admin login
          </Link>
        </div>
      </div>
    </main>
  );
}