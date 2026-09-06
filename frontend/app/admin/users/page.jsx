"use client";

/**
 * Admin user management (requirements 27-29) — /admin/users.
 *
 * - GET    /api/users             lists every account
 * - GET    /api/users/:id         powers the "View" dialog
 * - PATCH  /api/users/:id/status  activates / deactivates an account
 *
 * The route itself is gated by app/admin/layout.jsx (ProtectedRoute
 * requireAdmin), and the backend still authorises each request — a normal user
 * who forces the URL sees "Access Denied", and a 403 from the API is surfaced
 * as an error message rather than being ignored.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@/components/Alert";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import UserDetailsDialog from "@/components/UserDetailsDialog";
import UserTable from "@/components/UserTable";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import * as userService from "@/services/user.service";
import { displayName } from "@/utils/auth";
import { entityId } from "@/utils/format";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [term, setTerm] = useState("");
  const [viewing, setViewing] = useState(null); // row clicked in "View"
  const [statusTarget, setStatusTarget] = useState(null); // { user, nextActive }
  const [pendingId, setPendingId] = useState("");

  const load = useCallback(async ({ signal, silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError("");
    try {
      const data = await userService.getUsers({ signal });
      setUsers(data);
    } catch (requestError) {
      if (requestError?.name === "AbortError") return;
      setError(requestError?.message || "Unable to load users.");
      setUsers([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load({ signal: controller.signal });
    return () => controller.abort();
  }, [load]);

  /** Client-side filter over the API result (the endpoint has no search). */
  const filtered = useMemo(() => {
    const needle = term.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) => {
      const haystack = [
        displayName(user),
        user.email,
        user.role,
        user.isActive === false ? "inactive" : "active",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [users, term]);

  const activeCount = users.filter((user) => user.isActive !== false).length;

  async function handleConfirmStatus() {
    if (!statusTarget) return;
    const { user: target, nextActive } = statusTarget;
    const id = entityId(target);

    setPendingId(id);
    try {
      const message = await userService.setUserStatus(id, nextActive);

      // Requirement 29: the endpoint answers with a message only, so reload the
      // list from the API to show the change instead of guessing at the new row.
      // `silent` keeps the table on screen instead of flashing the loader.
      await load({ silent: true });
      toast.success(message);
      setStatusTarget(null);
    } catch (statusError) {
      toast.error(statusError?.message || "Unable to update the user status.");
    } finally {
      setPendingId("");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Users</h1>
          <p className="mt-1 text-sm text-ink-600">
            {loading
              ? "Loading accounts..."
              : `${users.length} ${
                  users.length === 1 ? "account" : "accounts"
                } · ${activeCount} active`}
          </p>
        </div>
        <SearchBar
          id="user-search"
          value={term}
          onChange={setTerm}
          placeholder="Search users..."
          className="w-full sm:max-w-xs"
        />
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {loading ? (
        <Loader label="Loading users..." />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found."
          description="Registered accounts will be listed here."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No users found."
          description={`No account matches "${term.trim()}".`}
        />
      ) : (
        <UserTable
          users={filtered}
          currentUserId={entityId(currentUser)}
          pendingId={pendingId}
          onView={setViewing}
          onToggleStatus={(user, nextActive) =>
            setStatusTarget({ user, nextActive })
          }
        />
      )}

      <UserDetailsDialog
        userId={viewing ? entityId(viewing) : ""}
        fallbackUser={viewing}
        onClose={() => setViewing(null)}
      />

      <ConfirmDialog
        open={Boolean(statusTarget)}
        title={
          statusTarget?.nextActive ? "Activate account" : "Deactivate account"
        }
        message={statusMessage(statusTarget)}
        confirmLabel={statusTarget?.nextActive ? "Activate" : "Deactivate"}
        confirmVariant={statusTarget?.nextActive ? "primary" : "danger"}
        loading={Boolean(pendingId)}
        onConfirm={handleConfirmStatus}
        onCancel={() => setStatusTarget(null)}
      />
    </div>
  );
}

/** Confirmation copy for the activate/deactivate dialog. */
function statusMessage(target) {
  if (!target) return "";
  const name = displayName(target.user);
  return target.nextActive
    ? `Are you sure you want to activate ${name}? They will be able to log in again.`
    : `Are you sure you want to deactivate ${name}? They will no longer be able to log in.`;
}
