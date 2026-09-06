"use client";

import Link from "next/link";

/** Friendly placeholder shown when the API returns no records (req. 33). */
export default function EmptyState({
  title = "Nothing here yet",
  description,
  actionHref,
  actionLabel,
  className = "",
}) {
  return (
    <div
      className={`rounded-xl border border-dashed border-ink-300 bg-white px-6 py-12 text-center ${className}`}
    >
      <p className="text-base font-semibold text-ink-800">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
          {description}
        </p>
      ) : null}
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex items-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
