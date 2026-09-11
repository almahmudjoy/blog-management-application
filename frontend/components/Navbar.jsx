"use client";

/**
 * Fixed application navbar (requirement 3).
 * - Guests see Login / Register.
 * - Authenticated users see the ProfileMenu whose avatar comes from
 *   GET /api/users/profile via AuthContext, so an avatar upload is reflected
 *   here immediately.
 * - Search submits to `/?search=...`; the blog service sends that value as
 *   the assignment's `title` query parameter.
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProfileMenu from "@/components/ProfileMenu";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar({ onToggleSidebar, showSidebarToggle = false }) {
  const { isAuthenticated, initialising } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [term, setTerm] = useState(searchParams.get("search") || "");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  function handleSearch(event) {
    event.preventDefault();
    const query = term.trim();
    router.push(query ? `/?search=${encodeURIComponent(query)}` : "/");
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-brand-100/80 bg-white/90 shadow-[0_4px_20px_rgba(31,71,224,0.06)] backdrop-blur">
      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-4 sm:px-6">
        {showSidebarToggle ? (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg border border-ink-300 p-2 text-ink-600 lg:hidden"
            aria-label="Open navigation menu"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        ) : null}

        <Link
          href="/"
          className="shrink-0 text-lg font-bold tracking-tight text-brand-800 transition hover:text-brand-600"
        >
          Blog<span className="text-ink-800">Space</span>
        </Link>

        <form
          onSubmit={handleSearch}
          role="search"
          className="mx-auto hidden w-full max-w-md md:block"
        >
          <label htmlFor="navbar-search" className="sr-only">
            Search blogs
          </label>
          <input
            id="navbar-search"
            type="search"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="Search Blogs..."
            className="w-full rounded-full border border-ink-200 bg-ink-50/80 px-4 py-2 text-sm text-ink-800 shadow-inner shadow-white placeholder:text-ink-400 transition focus:border-brand-400 focus:bg-white"
          />
        </form>

        <button
          type="button"
          onClick={() => setMobileSearchOpen((open) => !open)}
          className="rounded-lg border border-ink-200 bg-white p-2 text-ink-600 shadow-sm transition hover:border-brand-300 hover:text-brand-700 md:hidden"
          aria-label="Open blog search"
          aria-expanded={mobileSearchOpen}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
        </button>

        {mobileSearchOpen ? (
          <form
            onSubmit={handleSearch}
            role="search"
            className="absolute left-0 right-0 top-16 border-b border-brand-100 bg-white p-3 shadow-lg md:hidden"
          >
            <label htmlFor="mobile-navbar-search" className="sr-only">
              Search blogs
            </label>
            <input
              id="mobile-navbar-search"
              type="search"
              autoFocus
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Search Blogs..."
              className="w-full rounded-full border border-ink-200 bg-ink-50 px-4 py-2 text-sm text-ink-800 placeholder:text-ink-400"
            />
          </form>
        ) : null}

        <div className="ml-auto flex items-center gap-2">
          {initialising ? (
            <span className="skeleton h-9 w-24 rounded-full" />
          ) : isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700 sm:inline-block"
              >
                Dashboard
              </Link>
              <ProfileMenu />
            </>
          ) : (
            <>
              <Link
                href={pathname === "/login" ? "/login?reset=1" : "/login"}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition hover:bg-brand-50 hover:text-brand-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm shadow-brand-600/20 transition hover:bg-brand-700 hover:shadow-md"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
