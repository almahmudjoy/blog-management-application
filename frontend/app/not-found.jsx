/**
 * Global 404 (requirement 31: never show a raw framework error page).
 * Rendered by the root layout, so it is intentionally self-contained.
 */
import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-ink-200 bg-white p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-700">
          Error 404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">
          Page Not Found
        </h1>
        <p className="mt-3 text-sm text-ink-600">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Browse blogs
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
