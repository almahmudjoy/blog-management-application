/**
 * Root layout — renders <html>/<body> and mounts the global providers.
 *
 * AuthProvider must live here so authentication state survives navigation
 * between the public and dashboard shells (requirement 12).
 */
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";

export const metadata = {
  title: {
    default: "BlogSpace — Blog Management Application",
    template: "%s | BlogSpace",
  },
  description:
    "Browse, search and manage blogs. A Next.js frontend for the Blog REST API.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
