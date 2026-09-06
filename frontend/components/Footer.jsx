"use client";

/** Public footer used by the guest layout (requirement 2). */
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-100 bg-white/80">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-semibold text-ink-900">
            Blog<span className="text-brand-700">Space</span>
          </p>
          <p className="mt-1 text-xs text-ink-500">
            A focused home for practical engineering ideas.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 font-medium">
          <Link href="/" className="transition hover:text-brand-700">
            Home
          </Link>
          <Link href="/login" className="transition hover:text-brand-700">
            Login
          </Link>
          <Link href="/register" className="transition hover:text-brand-700">
            Register
          </Link>
        </nav>
      </div>
    </footer>
  );
}
