"use client";

/**
 * Edit blog page (requirement 18).
 * Loads the blog with GET /api/blogs/:id, pre-fills the shared BlogForm and
 * submits PUT /api/blogs/update/:id. Ownership is enforced by the backend; the
 * UI additionally blocks the form for blogs the user does not own.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import BlogForm from "@/components/BlogForm";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import * as blogService from "@/services/blog.service";
import { blogAuthorId, blogBody, blogTitle, entityId } from "@/utils/format";

export default function EditBlogPage() {
  const { id } = useParams();
  const blogId = Array.isArray(id) ? id[0] : id;
  const router = useRouter();
  const toast = useToast();
  const { user, isAdmin } = useAuth();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await blogService.getBlogById(blogId, {
          signal: controller.signal,
        });
        if (!cancelled) setBlog(data);
      } catch (requestError) {
        if (requestError?.name === "AbortError" || cancelled) return;
        setError(requestError?.message || "Blog not found.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [blogId]);

  async function handleSubmit(values) {
    // Message-only response: nothing to merge into local state, and the list
    // page reloads from the API when we navigate back to it.
    const message = await blogService.updateBlog(blogId, values);
    toast.success(message);
    router.push("/dashboard/blogs");
  }

  if (loading) return <Loader label="Loading blog..." />;

  if (error || !blog) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-ink-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-ink-900">Blog Not Found</h1>
        <p className="mt-2 text-sm text-ink-600">
          {error || "This blog no longer exists."}
        </p>
        <Link
          href="/dashboard/blogs"
          className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Back to blogs
        </Link>
      </div>
    );
  }

  const canEdit = isAdmin || blogAuthorId(blog) === entityId(user);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Edit Blog</h1>
        <p className="mt-1 text-sm text-ink-600">{blogTitle(blog)}</p>
      </header>

      {canEdit ? (
        <div className="rounded-2xl border border-ink-200 bg-white p-6">
          <BlogForm
            initialValues={{
              blogTitle: blogTitle(blog),
              category: blog.category || "",
              blog: blogBody(blog),
            }}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            pendingLabel="Saving..."
            onCancel={() => router.push("/dashboard/blogs")}
          />
        </div>
      ) : (
        <Alert variant="error">
          You are not authorized to update this blog.
        </Alert>
      )}
    </div>
  );
}
