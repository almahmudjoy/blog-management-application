/**
 * Authentication endpoints.
 *   POST /api/auth/register  -> { message, data: user }
 *   POST /api/auth/login     -> { message, data: { token, user } }
 *
 * The API stores names as `firstname` / `lastname`, so outbound bodies use
 * those keys and responses are normalised back to the `firstName` / `lastName`
 * shape the UI reads (see utils/format.js).
 *
 * The local backend returns a short-lived reset token outside production so
 * the flow can be tested without an email provider.
 */
import { apiRequest, unwrap } from "@/utils/api";
import { normalizeUser } from "@/utils/format";

export async function register({ firstName, lastName, email, password }) {
  const payload = await apiRequest("/auth/register", {
    method: "POST",
    body: {
      firstname: firstName.trim(),
      lastname: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
    },
  });
  return {
    message: payload?.message || "Registration successful. Please log in.",
    user: normalizeUser(unwrap(payload)),
  };
}

/**
 * Log in and return `{ token, user, message }`.
 * The API answers `{ message, data: { token, user } }`.
 */
export async function login({ email, password }) {
  const payload = await apiRequest("/auth/login", {
    method: "POST",
    body: { email: email.trim().toLowerCase(), password },
  });

  const data = unwrap(payload) || {};
  const token = data.token || null;

  if (!token) {
    throw new Error(
      "Login succeeded but no authentication token was returned by the API."
    );
  }

  return {
    token,
    user: normalizeUser(data.user),
    message: payload?.message || "Logged in.",
  };
}

export async function forgotPassword({ email }) {
  const payload = await apiRequest("/auth/forgot-password", {
    method: "POST",
    body: { email: email.trim().toLowerCase() },
  });
  return {
    message:
      payload?.message ||
      "If the email exists, a password reset link has been sent.",
    resetToken: payload?.resetToken || null,
  };
}

export async function resetPassword({ token, password }) {
  const payload = await apiRequest(
    `/auth/reset-password/${encodeURIComponent(token)}`,
    { method: "PATCH", body: { password } }
  );
  return payload?.message || "Password successfully changed.";
}

