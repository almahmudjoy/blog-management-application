"use client";

/**
 * Inline message block for backend errors / successes (requirement 31).
 * Errors use role="alert" so screen readers announce them immediately.
 */
const VARIANTS = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-brand-200 bg-brand-50 text-brand-800",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export default function Alert({ variant = "info", children, className = "" }) {
  if (!children) return null;

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant] || VARIANTS.info} ${className}`}
    >
      {children}
    </div>
  );
}
