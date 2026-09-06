"use client";

/**
 * Navbar avatar dropdown (requirement 23).
 * Closes on outside click and on Escape; the trigger exposes aria-expanded.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { useAuth } from "@/contexts/AuthContext";
import { displayName } from "@/utils/auth";

export default function ProfileMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  if (!user) return null;

  const links = [
    { href: "/dashboard/profile", label: "Profile" },
    { href: "/dashboard/change-password", label: "Change Password" },
  ];

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-ink-200 bg-white py-1 pl-1 pr-2.5 text-sm font-medium text-ink-700 hover:border-brand-300"
      >
        <Avatar user={user} size="xs" />
        <span className="hidden max-w-[9rem] truncate sm:inline">
          {displayName(user)}
        </span>
        <span aria-hidden="true" className="text-ink-400">
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ink-200 bg-white shadow-lg"
        >
          <div className="border-b border-ink-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-900">
              {displayName(user)}
            </p>
            <p className="truncate text-xs text-ink-500">{user.email}</p>
            {user.role ? (
              <span className="mt-2 inline-block rounded-full bg-ink-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-ink-600">
                {user.role}
              </span>
            ) : null}
          </div>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-ink-50"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="block w-full border-t border-ink-100 px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
