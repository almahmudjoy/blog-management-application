/**
 * Session helpers.
 *
 * The auth token is kept in localStorage so the session survives a page
 * refresh (requirement 12). On boot, AuthContext re-validates the token by
 * calling GET /api/users/profile — a stale/invalid token is therefore never
 * trusted by the UI, and the backend stays the single source of truth.
 */
const TOKEN_KEY = "blogspace.token";

/** Custom event fired when the API layer sees a 401 from an authed request. */
export const UNAUTHORIZED_EVENT = "blogspace:unauthorized";

const isBrowser = () => typeof window !== "undefined";

export function getToken() {
  if (!isBrowser()) return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    // localStorage can throw in private-mode / blocked-cookies scenarios.
    return null;
  }
}

export function setToken(token) {
  if (!isBrowser() || !token) return;
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore write failures — the user simply stays logged out after refresh */
  }
}

export function clearToken() {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function isAdmin(user) {
  return String(user?.role || "").toLowerCase() === "admin";
}

/**
 * Full name helper.
 * `normalizeUser` guarantees `firstName` / `lastName`, so those are read
 * directly; the email local-part is the fallback for the blog author rows,
 * which only carry an id and a name.
 */
export function displayName(user) {
  if (!user) return "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  if (name) return name;
  return user.email ? String(user.email).split("@")[0] : "User";
}

/** "John Doe" -> "JD" (used by the fallback avatar). */
export function initials(user) {
  const name = displayName(user);
  if (!name) return "?";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function notifyUnauthorized() {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent(UNAUTHORIZED_EVENT));
}
