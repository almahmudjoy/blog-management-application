"use client";

/**
 * Admin user table (requirement 27).
 *
 * Every row is API data from GET /api/users. The status action calls
 * PATCH /api/users/:id/status through the parent, which then refreshes the row
 * so the UI reflects the change immediately (requirement 29).
 *
 * There is deliberately no control for changing a user's `role` (requirement 42).
 */
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { displayName } from "@/utils/auth";
import { entityId, formatShortDate } from "@/utils/format";

/** Green/grey pill describing the account status. */
function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        active
          ? "bg-emerald-50 text-emerald-700"
          : "bg-ink-100 text-ink-600"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-ink-400"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export default function UserTable({
  users,
  currentUserId,
  pendingId = "",
  onView,
  onToggleStatus,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink-200 text-sm">
          <caption className="sr-only">
            Registered users with view and status actions
          </caption>
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                User
              </th>
              <th scope="col" className="px-4 py-3">
                Email
              </th>
              <th scope="col" className="px-4 py-3">
                Role
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Joined
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {users.map((user) => {
              const id = entityId(user);
              const active = user.isActive !== false;
              const isSelf = Boolean(currentUserId) && id === currentUserId;
              const pending = pendingId === id;

              return (
                <tr key={id} className="hover:bg-ink-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar user={user} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-ink-800">
                          {displayName(user)}
                        </p>
                        {isSelf ? (
                          <p className="text-xs text-ink-500">You</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    <span className="block max-w-[16rem] truncate">
                      {user.email || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize text-ink-600">
                    {user.role || "user"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={active} />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                    {formatShortDate(user.createdAt) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onView(user)}
                      >
                        View
                      </Button>
                      <Button
                        variant={active ? "danger" : "primary"}
                        size="sm"
                        loading={pending}
                        loadingLabel="Saving..."
                        // An admin cannot lock themselves out of the app.
                        disabled={isSelf}
                        title={
                          isSelf
                            ? "You cannot change your own status."
                            : undefined
                        }
                        onClick={() => onToggleStatus(user, !active)}
                      >
                        {active ? "Deactivate" : "Activate"}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
