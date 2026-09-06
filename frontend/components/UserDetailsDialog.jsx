"use client";

/**
 * User details modal (requirement 28) — GET /api/users/:id.
 *
 * The list response may be trimmed, so the dialog always re-reads the single
 * user endpoint when it opens and falls back to the row data while loading.
 */
import { useEffect, useRef, useState } from "react";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import Loader from "@/components/Loader";
import * as userService from "@/services/user.service";
import { displayName } from "@/utils/auth";
import { formatDate } from "@/utils/format";

function DetailRow({ label, children }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-sm text-ink-500">{label}</dt>
      <dd className="max-w-[60%] break-words text-right text-sm font-medium text-ink-800">
        {children}
      </dd>
    </div>
  );
}

export default function UserDetailsDialog({ userId, fallbackUser, onClose }) {
  const open = Boolean(userId);
  const closeRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch the full record every time the dialog opens for a new user.
  useEffect(() => {
    if (!userId) {
      setUser(null);
      setError("");
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await userService.getUserById(userId, {
          signal: controller.signal,
        });
        if (!cancelled) setUser(data);
      } catch (requestError) {
        if (requestError?.name === "AbortError" || cancelled) return;
        setError(requestError?.message || "Unable to load this user.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [userId]);

  // Escape closes the dialog; body scroll is locked while it is open.
  useEffect(() => {
    if (!open) return undefined;

    closeRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }
    document.addEventListener("keydown", handleKeyDown);

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const shown = user || fallbackUser || null;
  const active = shown?.isActive !== false;
  const joined = formatDate(shown?.createdAt);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/50"
        onClick={() => onClose?.()}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
      >
        <h2
          id="user-details-title"
          className="text-lg font-semibold text-ink-900"
        >
          User Information
        </h2>

        {error ? (
          <Alert variant="error" className="mt-4">
            {error}
          </Alert>
        ) : null}

        {loading && !shown ? (
          <Loader label="Loading user..." />
        ) : shown ? (
          <>
            <div className="mt-5 flex items-center gap-4">
              <Avatar user={shown} size="lg" />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink-900">
                  {displayName(shown)}
                </p>
                <p className="truncate text-sm text-ink-500">{shown.email}</p>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-ink-100 border-y border-ink-100">
              <DetailRow label="Name">{displayName(shown)}</DetailRow>
              <DetailRow label="Email">{shown.email || "—"}</DetailRow>
              <DetailRow label="Role">
                <span className="capitalize">{shown.role || "user"}</span>
              </DetailRow>
              <DetailRow label="Status">
                {active ? "Active" : "Inactive"}
              </DetailRow>
              <DetailRow label="Created Date">{joined || "—"}</DetailRow>
            </dl>

            {loading ? (
              <p className="mt-3 text-xs text-ink-500">
                Refreshing details...
              </p>
            ) : null}
          </>
        ) : null}

        <div className="mt-6 flex justify-end">
          <Button ref={closeRef} variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
