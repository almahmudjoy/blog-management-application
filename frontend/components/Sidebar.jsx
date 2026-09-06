"use client";

/**
 * Dashboard sidebar (requirement 4).
 * - Menu items differ by role; admin-only entries are filtered out for users.
 * - The active route is highlighted via aria-current + colour.
 * - On small screens it renders as an off-canvas drawer.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const USER_LINKS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/blogs", label: "My Blogs" },
  { href: "/dashboard/blogs/create", label: "Create Blog", exact: true },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/change-password", label: "Change Password" },
];

const ADMIN_LINKS = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/blogs", label: "All Blogs" },
  { href: "/dashboard/blogs/create", label: "Create Blog", exact: true },
  { href: "/admin/users", label: "Users" },
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/change-password", label: "Change Password" },
];

export default function Sidebar({ open = false, onClose }) {
  const pathname = usePathname();
  const { isAdmin, logout } = useAuth();
  const links = isAdmin ? ADMIN_LINKS : USER_LINKS;

  function isActive(link) {
    if (link.exact) return pathname === link.href;
    return pathname === link.href || pathname.startsWith(`${link.href}/`);
  }

  const nav = (
    <nav aria-label="Dashboard" className="flex h-full flex-col gap-1 p-4">
      {links.map((link) => {
        const active = isActive(link);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            aria-current={active ? "page" : undefined}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-brand-50 text-brand-700"
                : "text-ink-600 hover:bg-ink-100 hover:text-ink-900"
            }`}
          >
            {link.label}
          </Link>
        );
      })}

      <button
        type="button"
        onClick={() => {
          onClose?.();
          logout();
        }}
        className="mt-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Logout
      </button>
    </nav>
  );

  return (
    <>
      {/* Desktop: permanent column below the fixed navbar. */}
      <aside className="fixed left-0 top-16 hidden h-[calc(100vh-4rem)] w-60 overflow-y-auto border-r border-ink-200 bg-white lg:block">
        {nav}
      </aside>

      {/* Mobile: drawer. */}
      {open ? (
        <div className="lg:hidden">
          <div
            className="fixed inset-0 top-16 z-40 bg-ink-900/40"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 overflow-y-auto border-r border-ink-200 bg-white shadow-xl"
            aria-label="Dashboard navigation"
          >
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
