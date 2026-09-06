"use client";

/**
 * Dashboard shell (requirement 2): fixed Navbar + Sidebar + Main Content.
 * Shared by /dashboard/** and /admin/** so both areas look identical.
 * `requireAdmin` forwards to ProtectedRoute for role-based routes (req. 14).
 */
import { Suspense, useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardShell({ children, requireAdmin = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<div className="h-16 border-b border-ink-200" />}>
        <Navbar
          showSidebarToggle
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
      </Suspense>

      <div className="pt-16">
        <ProtectedRoute requireAdmin={requireAdmin}>
          <>
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <main className="lg:pl-60">
              <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                {children}
              </div>
            </main>
          </>
        </ProtectedRoute>
      </div>
    </div>
  );
}
