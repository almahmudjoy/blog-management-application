"use client";

/**
 * Blog management (requirements 17 & 19).
 * Table of blogs in scope with Edit / Delete actions. Delete asks for
 * confirmation first, then calls DELETE /api/blogs/delete/:id and refreshes
 * the list from the API.
 */
import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import BlogTable from "@/components/BlogTable";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import useDashboardBlogs from "@/hooks/useDashboardBlogs";
import * as blogService from "@/services/blog.service";
import { blogTitle, entityId } from "@/utils/format";

export default function DashboardBlogsPage() {
  const { user, isAdmin } = useAuth();
  const { blogs, loading, error, reload } = useDashboardBlogs();
  const toast = useToast();

  const [target, setTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      const message = await blogService.deleteBlog(entityId(target));
      toast.success(message);
      setTarget(null);
      await reload();
    } catch (deleteError) {
      toast.error(deleteError?.message || "Unable to delete this blog.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">
            {isAdmin ? "All Blogs" : "My Blogs"}
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            {isAdmin
              ? "Every blog published on the platform."
              : "Blogs you have published."}
          </p>
        </div>
        <Link
          href="/dashboard/blogs/create"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Create Blog
        </Link>
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {loading ? (
        <Loader label="Loading blogs..." />
      ) : blogs.length === 0 ? (
        <EmptyState
          title={
            isAdmin ? "No blogs found." : "You haven't created any blogs yet."
          }
          description="Blogs you publish will be listed here."
          actionHref="/dashboard/blogs/create"
          actionLabel="Create Blog"
        />
      ) : (
        <BlogTable
          blogs={blogs}
          currentUserId={entityId(user)}
          isAdmin={isAdmin}
          onRequestDelete={setTarget}
        />
      )}

      <ConfirmDialog
        open={Boolean(target)}
        title="Delete blog"
        message={
          target
            ? `Are you sure you want to delete "${blogTitle(target)}"? This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTarget(null)}
      />
    </div>
  );
}
