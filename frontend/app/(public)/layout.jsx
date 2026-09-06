/**
 * Public layout (requirement 2): Navbar + Main Content + Footer.
 *
 * This is a route group, so the URLs are unchanged: `(public)/page.jsx` is
 * still `/`, `(public)/login/page.jsx` is still `/login`, and so on.
 */
import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar reads the URL search params, so it needs a Suspense boundary. */}
      <Suspense fallback={<div className="h-16 border-b border-ink-200" />}>
        <Navbar />
      </Suspense>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-16 pt-24 sm:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
