"use client";

/** Blog preview card used on the public homepage (requirement 5). */
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { displayName } from "@/utils/auth";
import {
  blogAuthor,
  blogBody,
  blogTitle,
  entityId,
  excerpt,
  formatDate,
} from "@/utils/format";

export default function BlogCard({ blog }) {
  const id = entityId(blog);
  const author = blogAuthor(blog);
  const created = formatDate(blog?.createdAt);
  const title = blogTitle(blog);

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-ink-200/80 bg-white p-5 shadow-[0_8px_24px_rgba(20,25,34,0.04)] transition duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[0_16px_32px_rgba(31,71,224,0.12)]">
      {blog?.category ? (
        <span className="w-fit rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
          {blog.category}
        </span>
      ) : null}

      <h2 className="mt-3 text-lg font-semibold text-ink-900">
        <Link href={`/blogs/${id}`} className="transition-colors group-hover:text-brand-700 hover:text-brand-700">
          {title}
        </Link>
      </h2>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-ink-600">
        {excerpt(blogBody(blog), 180)}
      </p>

      <div className="mt-5 flex items-center gap-3 border-t border-ink-100 pt-4">
        <Avatar user={author} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-800">
            {author ? displayName(author) : "Unknown author"}
          </p>
          {created ? <p className="text-xs text-ink-500">{created}</p> : null}
        </div>
        <Link
          href={`/blogs/${id}`}
          className="shrink-0 rounded-lg border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
          aria-label={`Read more about ${title}`}
        >
          Read More
        </Link>
      </div>
    </article>
  );
}
