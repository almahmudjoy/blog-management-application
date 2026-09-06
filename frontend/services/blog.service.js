/**
 * Blog endpoints (verified against the Blog REST API source).
 *
 *   GET    /api/blogs            -> { success, data: [blog, ...] }
 *                                   query: ?title= (title OR body) & ?category=
 *   GET    /api/blogs/:id        -> { success, data: blog }
 *   POST   /api/blogs/create     -> { success, message, data: blog }  (auth)
 *   PUT    /api/blogs/update/:id -> { success, message }              (owner/admin)
 *   DELETE /api/blogs/delete/:id -> { success, message }              (owner/admin)
 *
 * The list/detail responses embed the author as `author` and use the API's
 * `createAt` / `updateAt` timestamp names; `normalizeBlog` maps both onto the
 * shape the components read.
 */
import { apiRequest, unwrap, unwrapList } from "@/utils/api";
import { normalizeBlog, normalizeBlogs } from "@/utils/format";


/**
 * Normalise a single-blog response.
 *
 * The guard matters because a blog's body column is itself named `blog`, so a
 * key-based unwrap would return the body string instead of the record. Only a
 * payload carrying `blogTitle` is treated as a blog.
 */
function pickBlog(payload) {
  const candidate = unwrap(payload);
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return null;
  }
  return candidate.blogTitle === undefined ? null : normalizeBlog(candidate);
}

/**
 * Fetch blogs, optionally filtered.
 *
 * The assignment names this parameter `title`; the backend also accepts the
 * older `search` spelling for clients from the previous API assignment.
 */
export async function getBlogs({ search, category, signal } = {}) {
  const payload = await apiRequest("/blogs", {
    params: { title: search, category },
    signal,
  });
  return normalizeBlogs(unwrapList(payload));
}

export async function getBlogById(id, { signal } = {}) {
  const payload = await apiRequest(`/blogs/${encodeURIComponent(id)}`, {
    signal,
  });
  return pickBlog(payload);
}

/**
 * Create a blog. Only the three allowed fields are sent — never `userId`
 * (requirement 16/42): the backend derives the author from the bearer token.
 */
export async function createBlog({ blogTitle, blog, category }) {
  const payload = await apiRequest("/blogs/create", {
    method: "POST",
    auth: true,
    body: {
      blogTitle: blogTitle.trim(),
      blog: blog.trim(),
      category: category.trim(),
    },
  });
  return {
    blog: pickBlog(payload),
    message: payload?.message || "Blog created successfully.",
  };
}

/**
 * Update a blog.
 * Resolves to the success message — the endpoint returns no record, so the
 * caller must refetch to show fresh data.
 */
export async function updateBlog(id, { blogTitle, blog, category }) {
  const payload = await apiRequest(`/blogs/update/${encodeURIComponent(id)}`, {
    method: "PUT",
    auth: true,
    body: {
      blogTitle: blogTitle.trim(),
      blog: blog.trim(),
      category: category.trim(),
    },
  });
  return payload?.message || "Blog updated successfully.";
}

/** Delete a blog. Message-only response, so the caller must reload the list. */
export async function deleteBlog(id) {
  const payload = await apiRequest(`/blogs/delete/${encodeURIComponent(id)}`, {
    method: "DELETE",
    auth: true,
  });
  return payload?.message || "Blog deleted successfully.";
}

