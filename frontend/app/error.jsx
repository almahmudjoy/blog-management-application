"use client";

/**
 * Route-level error boundary (requirement 31).
 * Unexpected render errors become a readable panel with a retry action instead
 * of a raw JavaScript stack trace.
 */
import Link from "next/link";
import Button from "@/components/Button";

export default function GlobalError({ error, reset }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-red-900">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-red-800">
          An unexpected error occurred. Please try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => reset()}>Try again</Button>
          <Link
            href="/"
            className="inline-flex items-center rounded-lg border border-ink-300 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
