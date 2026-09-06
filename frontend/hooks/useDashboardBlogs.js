"use client";

/**
 * Shared data hook for the dashboard blog screens.
 *
 * The API only filters by search/category, so ownership scoping is applied on
 * the client: normal users see their own blogs ("My Blogs"), admins see every
 * blog ("All Blogs"). Deletion/update permissions are still enforced by the
 * backend — this only decides what to render.
 *
 * `blogAuthorId` reads the populated `author` object the list endpoint returns
 * (there is no `userId` on those rows) and stringifies it, so the comparison
 * against `entityId(user)` is string-to-string.
 */
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import * as blogService from "@/services/blog.service";
import { blogAuthorId, entityId } from "@/utils/format";

function sortByNewest(blogs) {
  return [...blogs].sort(
    (a, b) =>
      new Date(b.createdAt || 0).getTime() -
      new Date(a.createdAt || 0).getTime()
  );
}

export default function useDashboardBlogs() {
  const { user, isAdmin } = useAuth();
  const userId = entityId(user);

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");
      try {
        const all = await blogService.getBlogs({ signal });
        const scoped = isAdmin
          ? all
          : all.filter((blog) => blogAuthorId(blog) === userId);
        setBlogs(sortByNewest(scoped));
      } catch (requestError) {
        if (requestError?.name === "AbortError") return;
        setError(requestError?.message || "Unable to load blogs.");
        setBlogs([]);
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, userId]
  );

  useEffect(() => {
    if (!userId) return undefined;
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load, userId]);

  return { blogs, loading, error, reload: () => load(), isAdmin, userId };
}
