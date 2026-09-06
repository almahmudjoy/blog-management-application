/** Dashboard layout — authenticated shell for /dashboard/** (requirement 13). */
import DashboardShell from "@/components/DashboardShell";

export default function DashboardLayout({ children }) {
  return <DashboardShell>{children}</DashboardShell>;
}
