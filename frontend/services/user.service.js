/**
 * User endpoints (verified against the Blog REST API source).
 *
 *   GET    /api/users                -> [user, ...]   (admin, bare array)
 *   GET    /api/users/:id            -> user          (admin, bare object)
 *   PATCH  /api/users/:id/status     -> { message }    (admin)
 *   GET    /api/users/profile        -> user          (bare object)
 *   PUT    /api/users/profile/update -> { message }
 *   PATCH  /api/users/profile/image  -> { message }    (multipart, field "image")
 *   PATCH  /api/users/password       -> { message }
 *
 * Two contract details are handled here so no page has to care:
 *  - the API returns `firstname` / `lastname` / `createAt`, which
 *    `normalizeUser` maps to `firstName` / `lastName` / `createdAt`;
 *  - the message-only endpoints return no record at all, so those
 *    functions resolve to a plain message string and the caller refetches.
 */
import { apiRequest, unwrap, unwrapList } from "@/utils/api";
import { normalizeUser, normalizeUsers } from "@/utils/format";

/**
 * Normalise a single-user response.
 * The profile and by-id endpoints answer with a bare user object (no envelope),
 * so `unwrap` passes the payload straight through.
 */
function pickUser(payload) {
  const candidate = unwrap(payload);
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }
  return candidate.email === undefined && candidate.id === undefined
    ? null
    : normalizeUser(candidate);
}

export async function getProfile({ signal } = {}) {
  const payload = await apiRequest("/users/profile", { auth: true, signal });
  return pickUser(payload);
}

/**
 * Update the signed-in user's name.
 *
 * Only firstname/lastname are sent: the API rejects the request outright if it
 * sees `role`, `isActive` or a different `email` (requirement 42).
 * Resolves to the success message — the endpoint returns no record, so the
 * caller must re-read the profile.
 */
export async function updateProfile({ firstName, lastName }) {
  const payload = await apiRequest("/users/profile/update", {
    method: "PUT",
    auth: true,
    body: { firstname: firstName.trim(), lastname: lastName.trim() },
  });
  return payload?.message || "Profile updated successfully.";
}

/**
 * Upload a new avatar (multipart/form-data, field "image").
 *
 * The backend stores the file under `uploads/profile/`, saves the relative
 * path in the `users.profileImage` column and answers with a success message.
 * JPG/JPEG/PNG/WEBP up to 2 MB are accepted — the same constraints the client
 * enforces first in `validateImageFile`.
 *
 * Resolves to the success message; the caller re-reads the profile so the new
 * avatar appears in the navbar without a re-login.
 */
export async function uploadProfileImage(file) {
  const form = new FormData();
  form.append("image", file);

  const payload = await apiRequest("/users/profile/image", {
    method: "PATCH",
    auth: true,
    body: form,
  });
  return payload?.message || "Profile image updated successfully.";
}

export async function changePassword({ password }) {
  const payload = await apiRequest("/users/password", {
    method: "PATCH",
    auth: true,
    body: { password },
  });
  return payload?.message || "Password updated successfully.";
}

export async function getUsers({ signal } = {}) {
  const payload = await apiRequest("/users", { auth: true, signal });
  return normalizeUsers(unwrapList(payload));
}

export async function getUserById(id, { signal } = {}) {
  const payload = await apiRequest(`/users/${encodeURIComponent(id)}`, {
    auth: true,
    signal,
  });
  return pickUser(payload);
}

/**
 * Activate / deactivate an account.
 * Resolves to the success message — the endpoint returns no record, so the
 * caller must reload the user list.
 */
export async function setUserStatus(id, isActive) {
  const payload = await apiRequest(`/users/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    auth: true,
    body: { isActive: Boolean(isActive) },
  });
  return (
    payload?.message ||
    `User ${isActive ? "activated" : "deactivated"} successfully.`
  );
}
