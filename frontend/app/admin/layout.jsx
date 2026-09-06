/** Admin layout — same shell, but gated on the admin role (requirement 14). */
import DashboardShell from "@/components/DashboardShell";

export default function AdminLayout({ children }) {
  return <DashboardShell requireAdmin>{children}</DashboardShell>;
}
