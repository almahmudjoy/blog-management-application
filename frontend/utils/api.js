/**
 * Single low-level HTTP layer for the Blog REST API.
 *
 * Responsibilities:
 *  - build the request URL from NEXT_PUBLIC_API_URL
 *  - attach `Authorization: Bearer <token>` to authenticated requests
 *  - JSON-encode bodies (and pass FormData through untouched so the browser
 *    can set the multipart boundary itself)
 *  - normalise every backend/network failure into an ApiError with a readable
 *    `message`, so screens never show a raw JS error (requirement 31)
 *  - broadcast 401s so AuthContext can clear the session (requirement 42)
 */
import { getToken, clearToken, notifyUnauthorized } from "@/utils/auth";

const RAW_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

/** API base without a trailing slash, e.g. "http://localhost:5000/api". */
export const API_BASE_URL = RAW_BASE.replace(/\/+$/, "");

/** Server origin (API base minus the trailing "/api") used for file URLs. */
export const SERVER_ORIGIN = (
  process.env.NEXT_PUBLIC_UPLOADS_URL || API_BASE_URL.replace(/\/api\/?$/, "")
).replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/** True when a response body is an HTML document rather than an API message. */
function looksLikeHtml(value) {
  if (typeof value !== "string") return false;
  return /^\s*(<!doctype html|<html|<pre>|<body)/i.test(value);
}

/** Pull the most human-readable message out of an arbitrary error payload. */
function extractMessage(payload, status) {
  // The API has no 404 handler, so unknown routes answer with Express's
  // default HTML error page. Never surface raw markup to the user — fall
  // through to the status-based message below instead.
  if (typeof payload === "string" && payload.trim() && !looksLikeHtml(payload)) {
    return payload.trim();
  }

  if (payload && typeof payload === "object") {
    const direct =
      payload.message || payload.error || payload.msg || payload.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();

    // express-validator style: { errors: [{ msg | message }] }
    const list = payload.errors || payload.error?.errors;
    if (Array.isArray(list) && list.length) {
      const joined = list
        .map((item) =>
          typeof item === "string" ? item : item?.msg || item?.message
        )
        .filter(Boolean)
        .join(", ");
      if (joined) return joined;
    }
    // mongoose style: { errors: { field: { message } } }
    if (list && typeof list === "object" && !Array.isArray(list)) {
      const joined = Object.values(list)
        .map((item) => item?.message || item?.msg)
        .filter(Boolean)
        .join(", ");
      if (joined) return joined;
    }
  }

  const fallbacks = {
    400: "The request could not be processed. Please check your input.",
    401: "Your session has expired. Please log in again.",
    403: "You are not authorized to perform this action.",
    404: "The requested resource was not found.",
    409: "This record already exists.",
    413: "The uploaded file is too large.",
    422: "Some of the submitted values are invalid.",
    429: "Too many requests. Please try again in a moment.",
    500: "The server encountered an error. Please try again later.",
  };
  return fallbacks[status] || `Request failed (status ${status}).`;
}

async function parseBody(response) {
  const type = response.headers.get("content-type") || "";
  try {
    if (type.includes("application/json")) return await response.json();
    const text = await response.text();
    return text || null;
  } catch {
    return null;
  }
}

/**
 * Perform an API request.
 *
 * @param {string} path            Endpoint path, e.g. "/blogs" or "/auth/login".
 * @param {object} [options]
 * @param {string} [options.method]  HTTP verb (default "GET").
 * @param {any}    [options.body]    Plain object (JSON-encoded) or FormData.
 * @param {object} [options.params]  Query params; empty values are dropped.
 * @param {boolean}[options.auth]    Attach the bearer token (default false).
 * @param {AbortSignal}[options.signal]
 */
export async function apiRequest(
  path,
  { method = "GET", body, params, auth = false, signal } = {}
) {
  const url = new URL(
    `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`
  );

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.set(key, String(value));
    });
  }

  const headers = { Accept: "application/json" };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      signal,
      body:
        body === undefined
          ? undefined
          : isFormData
            ? body
            : JSON.stringify(body),
      // Always hit the network: lists must reflect the latest API state.
      cache: "no-store",
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw new ApiError(
      "Unable to reach the server. Please check that the Blog API is running.",
      0,
      null
    );
  }

  const payload = await parseBody(response);

  if (!response.ok) {
    // Requirement 42: never ignore 401/403 responses.
    if (response.status === 401 && auth) {
      clearToken();
      notifyUnauthorized();
    }
    throw new ApiError(
      extractMessage(payload, response.status),
      response.status,
      payload
    );
  }

  return payload;
}

/**
 * Unwrap the `{ success, message, data }` envelope used by the blog endpoints.
 *
 * The user endpoints are not enveloped — `GET /api/users` answers with a bare
 * array and `GET /api/users/:id` with a bare record — so a payload that has no
 * `data` key is returned untouched. Extra keys handle the one endpoint that
 * nests a level deeper: `POST /api/auth/login` returns
 * `{ message, data: { token, user } }`, so `unwrap(payload, "user")` reaches
 * the user.
 *
 * Nothing is guessed at beyond those keys: an unrecognised shape is returned
 * as-is rather than being searched for something that looks close enough.
 */
export function unwrap(payload, ...keys) {
  if (payload === null || payload === undefined) return null;
  if (Array.isArray(payload)) return payload;
  if (typeof payload !== "object") return payload;

  for (const key of [...keys, "data"]) {
    if (key && payload[key] !== undefined && payload[key] !== null) {
      return payload[key];
    }
  }
  return payload;
}

/**
 * Unwrap a list response into an array.
 *
 * Covers both list shapes the API actually returns — the enveloped
 * `{ success, data: [...] }` from `GET /api/blogs` and the bare array from
 * `GET /api/users` — so pages never have to test for an envelope. Anything
 * else yields an empty array, which the callers already render as an empty
 * state.
 */
export function unwrapList(payload, ...keys) {
  const candidate = unwrap(payload, ...keys);
  return Array.isArray(candidate) ? candidate : [];
}
