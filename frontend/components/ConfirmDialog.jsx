"use client";

/**
 * Modal confirmation dialog (requirement 19).
 * - Escape closes it, focus moves to the confirm button on open.
 * - role="dialog" + aria-modal + labelled title for assistive tech.
 */
import { useEffect, useRef } from "react";
import Button from "@/components/Button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmVariant = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    confirmRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape" && !loading) onCancel?.();
    }
    document.addEventListener("keydown", handleKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50"
        onClick={() => !loading && onCancel?.()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby={message ? "confirm-dialog-message" : undefined}
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="confirm-dialog-title"
          className="text-lg font-semibold text-ink-900"
        >
          {title}
        </h2>
        {message ? (
          <p id="confirm-dialog-message" className="mt-2 text-sm text-ink-600">
            {message}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            ref={confirmRef}
            variant={confirmVariant}
            onClick={onConfirm}
            loading={loading}
            loadingLabel="Working..."
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
