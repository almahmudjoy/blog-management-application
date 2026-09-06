/**
 * Blog details page (requirement 9) — /blogs/[id].
 *
 * Rendered on the server so guests get the full post in the first response.
 * A 404 from GET /api/blogs/:id is turned into a friendly "Blog Not Found"
 * screen instead of a raw error.
 */
import Link from "next/link";
import Avatar from "@/components/Avatar";
import * as blogService from "@/services/blog.service";
import { displayName } from "@/utils/auth";
import { blogAuthor, blogBody, blogTitle, formatDate } from "@/utils/format";

// The blog list changes as authors publish, so never cache this page.
export const dynamic = "force-dynamic";

async function loadBlog(id) {
  try {
    const blog = await blogService.getBlogById(id);
    return { blog, error: "" };
  } catch (error) {
    return { blog: null, error: error?.message || "Unable to load this blog." };
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { blog } = await loadBlog(id);
  return { title: blog ? blogTitle(blog) : "Blog Not Found" };
}

export default async function BlogDetailsPage({ params }) {
  const { id } = await params;
  const { blog, error } = await loadBlog(id);

  if (!blog) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-ink-200 bg-white p-10 text-center">
        <h1 className="text-2xl font-bold text-ink-900">Blog Not Found</h1>
        <p className="mt-3 text-sm text-ink-600">
          {error || "The blog you are looking for does not exist."}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Browse all blogs
        </Link>
      </div>
    );
  }

  const author = blogAuthor(blog);
  const created = formatDate(blog.createdAt);

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/"
        className="text-sm font-medium text-brand-700 hover:underline"
      >
        ← Back to blogs
      </Link>

      <header className="mt-4">
        {blog.category ? (
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            {blog.category}
          </span>
        ) : null}
        <h1 className="mt-3 text-3xl font-bold leading-tight text-ink-900">
          {blogTitle(blog)}
        </h1>

        <div className="mt-5 flex items-center gap-3 border-y border-ink-200 py-4">
          <Avatar user={author} size="md" />
          <div>
            <p className="text-sm font-semibold text-ink-800">
              {author ? displayName(author) : "Unknown author"}
            </p>
            {created ? (
              <p className="text-xs text-ink-500">Published {created}</p>
            ) : null}
          </div>
        </div>
      </header>

      {/* whitespace-pre-line keeps the author's paragraph breaks. */}
      <div className="mt-6 whitespace-pre-line text-[15px] leading-7 text-ink-700">
        {blogBody(blog)}
      </div>
    </article>
  );
}
