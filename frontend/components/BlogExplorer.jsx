"use client";

/**
 * Public blog explorer: search + category filter + card grid.
 *
 * Filters live in the URL (`/?search=playwright&category=Testing`) so results
 * are shareable and the navbar search can drive this list. The API service maps
 * the UI search value to the assignment's `title` query parameter.
 */
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";
import BlogCard from "@/components/BlogCard";
import CategoryFilter from "@/components/CategoryFilter";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import SearchBar from "@/components/SearchBar";
import * as blogService from "@/services/blog.service";
import { entityId } from "@/utils/format";

export default function BlogExplorer() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [draftSearch, setDraftSearch] = useState(search);

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await blogService.getBlogs({
          search,
          category,
          signal: controller.signal,
        });
        if (!cancelled) setBlogs(data);
      } catch (requestError) {
        if (requestError?.name === "AbortError" || cancelled) return;
        setError(requestError?.message || "Unable to load blogs.");
        setBlogs([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [search, category]);

  /** Push the new filter state into the URL (replace = no history spam). */
  const updateFilters = useCallback(
    (next) => {
      const params = new URLSearchParams();
      const nextSearch = next.search ?? search;
      const nextCategory = next.category ?? category;
      if (nextSearch) params.set("search", nextSearch);
      if (nextCategory) params.set("category", nextCategory);
      const query = params.toString();
      router.replace(query ? `/?${query}` : "/", { scroll: false });
    },
    [router, search, category]
  );

  useEffect(() => {
    if (draftSearch === search) return undefined;
    const timer = window.setTimeout(() => {
      updateFilters({ search: draftSearch });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [draftSearch, search, updateFilters]);

  const hasFilters = Boolean(search || category);

  return (
    <section aria-labelledby="latest-blogs-heading">
      <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-white p-6 shadow-[0_18px_45px_rgba(31,71,224,0.08)] sm:p-10">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-brand-50/80" aria-hidden="true" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
            The BlogSpace journal
          </p>
          <h1 className="mt-3 max-w-2xl text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Discover ideas worth sharing
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-600 sm:text-base">
            Explore practical thinking on testing, automation, engineering, and
            the tools shaping modern software teams.
          </p>

          <div className="mt-7 rounded-2xl border border-ink-100 bg-ink-50/70 p-3 shadow-inner shadow-white sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <SearchBar
                value={draftSearch}
                onChange={setDraftSearch}
                className="lg:max-w-sm lg:flex-1"
              />
              <CategoryFilter
                value={category}
                onChange={(value) => updateFilters({ category: value })}
                className="lg:ml-auto"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-end justify-between gap-4 border-b border-ink-200/80 pb-4">
        <h2
          id="latest-blogs-heading"
          className="text-xl font-semibold tracking-tight text-ink-900"
        >
          {hasFilters ? "Search results" : "Latest blogs"}
        </h2>
        {!loading && !error ? (
          <p className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink-500 shadow-sm ring-1 ring-ink-100">
            {blogs.length} {blogs.length === 1 ? "blog" : "blogs"}
          </p>
        ) : null}
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Loader variant="skeleton" rows={3} label="Loading blogs..." />
          </div>
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : blogs.length === 0 ? (
          <EmptyState
            title="No blogs found."
            description={
              hasFilters
                ? "Try a different search term or category."
                : "No blogs have been published yet. Check back soon."
            }
          />
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <li key={entityId(blog)}>
                <BlogCard blog={blog} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
