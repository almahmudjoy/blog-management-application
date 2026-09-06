"use client";

/** Inline loading feedback: spinner with a label, or skeleton placeholders. */
export default function Loader({
  label = "Loading...",
  variant = "spinner",
  rows = 3,
  className = "",
}) {
  if (variant === "skeleton") {
    return (
      <div
        className={`space-y-4 ${className}`}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <span className="sr-only">{label}</span>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-ink-200 bg-white p-5"
          >
            <div className="skeleton h-4 w-24" />
            <div className="skeleton mt-3 h-5 w-3/4" />
            <div className="skeleton mt-2 h-3 w-full" />
            <div className="skeleton mt-2 h-3 w-5/6" />
            <div className="mt-4 flex items-center gap-3">
              <div className="skeleton h-8 w-8 rounded-full" />
              <div className="skeleton h-3 w-32" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center justify-center gap-3 py-10 text-ink-500 ${className}`}
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Spinner({ className = "h-5 w-5" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}
