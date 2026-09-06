"use client";

import { Spinner } from "@/components/Loader";

const VARIANTS = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 disabled:hover:bg-brand-600",
  secondary:
    "border border-ink-300 bg-white text-ink-700 hover:bg-ink-100 disabled:hover:bg-white",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:hover:bg-red-600",
  ghost: "text-ink-600 hover:bg-ink-100 disabled:hover:bg-transparent",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-sm",
};

/**
 * Button with a built-in pending state (requirement 32).
 * While `loading` is true the button is disabled, so a double click cannot
 * submit the same form twice.
 */
export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  loadingLabel,
  disabled = false,
  className = "",
  children,
  // React 19 passes `ref` as a normal prop to function components, so it is
  // destructured explicitly here to make the forwarding obvious.
  ref,
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size] || SIZES.md} ${className}`}
      {...rest}
    >
      {loading ? <Spinner className="h-4 w-4" /> : null}
      <span>{loading && loadingLabel ? loadingLabel : children}</span>
    </button>
  );
}
