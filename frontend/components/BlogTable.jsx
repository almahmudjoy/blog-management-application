"use client";

/**
 * Blog management table (requirement 17).
 * Edit/Delete are disabled for rows the current user cannot manage; the
 * backend still authorises every request.
 */
import Link from "next/link";
import Button from "@/components/Button";
import { displayName } from "@/utils/auth";
import {
  blogAuthor,
  blogAuthorId,
  blogTitle,
  entityId,
  formatShortDate,
} from "@/utils/format";

export default function BlogTable({
  blogs,
  currentUserId,
  isAdmin,
  onRequestDelete,
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-ink-200 text-sm">
          <caption className="sr-only">
            Blogs with edit and delete actions
          </caption>
          <thead className="bg-ink-50 text-left text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                Title
              </th>
              <th scope="col" className="px-4 py-3">
                Category
              </th>
              <th scope="col" className="px-4 py-3">
                Author
              </th>
              <th scope="col" className="px-4 py-3">
                Created
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {blogs.map((blog) => {
              const id = entityId(blog);
              const author = blogAuthor(blog);
              const canManage = isAdmin || blogAuthorId(blog) === currentUserId;

              return (
                <tr key={id} className="hover:bg-ink-50/60">
                  <td className="max-w-xs px-4 py-3">
                    <Link
                      href={`/blogs/${id}`}
                      className="font-medium text-ink-800 hover:text-brand-700"
                    >
                      {blogTitle(blog)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {blog.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-ink-600">
                    {author ? displayName(author) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink-600">
                    {formatShortDate(blog.createdAt) || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/dashboard/blogs/${id}/edit`}
                        aria-disabled={!canManage}
                        tabIndex={canManage ? undefined : -1}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                          canManage
                            ? "border-ink-300 text-ink-700 hover:bg-ink-100"
                            : "pointer-events-none border-ink-200 text-ink-300"
                        }`}
                      >
                        Edit
                      </Link>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={!canManage}
                        onClick={() => onRequestDelete(blog)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
