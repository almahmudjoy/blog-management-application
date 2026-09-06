/** Presentation helpers shared by pages and components. */
import { SERVER_ORIGIN } from "@/utils/api";

/** Format an ISO date as e.g. "Sep 2, 2026". Returns "" for missing dates. */
export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Short date used in dense tables, e.g. "Sep 2". */
export function formatShortDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Trim long blog bodies down to a card-sized preview. */
export function excerpt(text, maxLength = 160) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength).trimEnd()}…`;
}

/**
 * Resolve a profile-image value coming from the API into a usable URL.
 * The backend may return an absolute URL, a relative path ("/uploads/a.png")
 * or a bare filename ("a.png").
 */
export function resolveImageUrl(image) {
  if (!image || typeof image !== "string") return "";
  const value = image.trim();
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:")) return value;
  if (value.startsWith("/")) return `${SERVER_ORIGIN}${value}`;
  if (value.startsWith("uploads")) return `${SERVER_ORIGIN}/${value}`;
  return `${SERVER_ORIGIN}/uploads/${value}`;
}

/**
 * Read the id of an entity regardless of `_id` / `id` naming.
 * The Blog REST API is SQL-backed, so ids are numbers — they are stringified
 * here so every comparison in the app is string-to-string.
 */
export function entityId(entity) {
  if (entity === null || entity === undefined) return "";
  if (typeof entity === "string" || typeof entity === "number") {
    return String(entity);
  }
  const id = entity._id ?? entity.id;
  return id === null || id === undefined ? "" : String(id);
}

/**
 * Created / updated timestamps.
 *
 * The backend declares its Sequelize timestamps as `createAt` / `updateAt`
 * (without the "d") on both models. This function is the only place that knows
 * about that spelling: `normalizeUser` / `normalizeBlog` copy the value onto
 * `createdAt` / `updatedAt`, and every component reads those. The second
 * spelling is kept so an already-normalised entity can be re-normalised
 * safely (e.g. a user pushed back into AuthContext).
 */
export function entityCreatedAt(entity) {
  return entity?.createAt || entity?.createdAt || "";
}

export function entityUpdatedAt(entity) {
  return entity?.updateAt || entity?.updatedAt || "";
}

/**
 * The blog author.
 *
 * `GET /api/blogs` and `GET /api/blogs/:id` include a populated `author`
 * (id + firstname + lastname) and deliberately omit `userId`, while
 * `POST /api/blogs/create` echoes a bare numeric `userId` and no author.
 * Returns an object shaped like a user, or null when only an id is available.
 */
export function blogAuthor(blog) {
  const author = blog?.author ?? null;
  if (!author || typeof author !== "object") return null;
  return author;
}

/**
 * Author id for ownership checks.
 * Falls back to the bare `userId` from the create response, and always returns
 * a string so comparisons against `entityId(user)` are string-to-string.
 */
export function blogAuthorId(blog) {
  return entityId(blog?.author ?? blog?.userId ?? null);
}

/**
 * Map an API user onto the shape the UI reads.
 *
 * The API returns `firstname` / `lastname` / `createAt`; components use
 * `firstName` / `lastName` / `createdAt`. Normalising once at the service
 * boundary keeps that difference out of every page, and the original API
 * spellings are preserved so a normalised user can still be sent back.
 */
export function normalizeUser(user) {
  if (!user || typeof user !== "object") return null;

  const firstName = user.firstName ?? user.firstname ?? "";
  const lastName = user.lastName ?? user.lastname ?? "";
  const createdAt = entityCreatedAt(user);
  const updatedAt = entityUpdatedAt(user);

  return {
    ...user,
    firstName,
    lastName,
    firstname: user.firstname ?? firstName,
    lastname: user.lastname ?? lastName,
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
}

export function normalizeUsers(users) {
  return Array.isArray(users) ? users.map(normalizeUser).filter(Boolean) : [];
}

/** Same idea for blogs: normalise the timestamps and the embedded author. */
export function normalizeBlog(blog) {
  if (!blog || typeof blog !== "object") return null;

  const author = blogAuthor(blog);
  const createdAt = entityCreatedAt(blog);
  const updatedAt = entityUpdatedAt(blog);

  return {
    ...blog,
    ...(author ? { author: normalizeUser(author) } : {}),
    ...(createdAt ? { createdAt } : {}),
    ...(updatedAt ? { updatedAt } : {}),
  };
}

export function normalizeBlogs(blogs) {
  return Array.isArray(blogs) ? blogs.map(normalizeBlog).filter(Boolean) : [];
}

/**
 * Accessors for the two oddly-named blog columns.
 * The API column is `blogTitle` for the heading and `blog` for the body, so
 * these read exactly those fields — nothing else is guessed at.
 */
export function blogTitle(blog) {
  return blog?.blogTitle || "Untitled blog";
}

export function blogBody(blog) {
  return blog?.blog || "";
}
