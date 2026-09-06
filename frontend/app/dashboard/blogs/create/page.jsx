"use client";

/** Create blog page (requirement 16) — POST /api/blogs/create. */
import { useRouter } from "next/navigation";
import BlogForm from "@/components/BlogForm";
import { useToast } from "@/contexts/ToastContext";
import * as blogService from "@/services/blog.service";

export default function CreateBlogPage() {
  const router = useRouter();
  const toast = useToast();

  async function handleSubmit(values) {
    // Only blogTitle/blog/category are sent — the backend resolves the author
    // from the bearer token, so no userId is ever posted.
    const { message } = await blogService.createBlog(values);
    toast.success(message);
    router.push("/dashboard/blogs");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Create Blog</h1>
        <p className="mt-1 text-sm text-ink-600">
          Publish a new post. It will appear on the public homepage immediately.
        </p>
      </header>

      <div className="rounded-2xl border border-ink-200 bg-white p-6">
        <BlogForm
          onSubmit={handleSubmit}
          submitLabel="Publish Blog"
          pendingLabel="Publishing..."
          onCancel={() => router.push("/dashboard/blogs")}
        />
      </div>
    </div>
  );
}
