"use client";

/**
 * Route guard for authenticated areas (requirements 13 & 14).
 *
 * Client-side guarding is used because the token lives in localStorage; it is a
 * UX layer only. Every protected request still carries the bearer token and the
 * backend's 401/403 responses are surfaced by the API layer, so hiding UI is
 * never the only line of defence.
 */
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, initialising } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (initialising) return;
    if (!isAuthenticated) {
      // Preserve the intended destination so login can return the user there.
      const next = encodeURIComponent(pathname || "/dashboard");
      router.replace(`/login?next=${next}`);
    }
  }, [initialising, isAuthenticated, pathname, router]);

  if (initialising) {
    return <Loader label="Checking your session..." />;
  }

  if (!isAuthenticated) {
    return <Loader label="Redirecting to login..." />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 p-8 text-center">
        <h1 className="text-xl font-semibold text-red-800">Access Denied</h1>
        <p className="mt-2 text-sm text-red-700">
          This area is restricted to administrators.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return children;
}
