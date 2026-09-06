"use client";

/**
 * Dashboard overview (requirement 15).
 * Everything shown here comes from the API: the profile from AuthContext
 * (GET /api/users/profile) and the blog stats from GET /api/blogs.
 */
import Link from "next/link";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import Loader from "@/components/Loader";
import { useAuth } from "@/contexts/AuthContext";
import useDashboardBlogs from "@/hooks/useDashboardBlogs";
import { displayName } from "@/utils/auth";
import { blogTitle, entityId, formatDate } from "@/utils/format";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const { blogs, loading, error } = useDashboardBlogs();

  const categories = new Set(
    blogs.map((blog) => blog.category).filter(Boolean)
  );
  const recent = blogs.slice(0, 5);

  const stats = [
    { label: isAdmin ? "Total Blogs" : "My Blogs", value: blogs.length },
    { label: "Categories Covered", value: categories.size },
    { label: "Role", value: user?.role || "user" },
  ];

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-ink-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-ink-900">
          Welcome, {user?.firstName || displayName(user)}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          {isAdmin
            ? "You have administrator access: manage every blog and all users."
            : "Manage your blogs and keep your profile up to date."}
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/dashboard/blogs/create"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Quick Create Blog
          </Link>
          <Link
            href="/dashboard/blogs"
            className="rounded-lg border border-ink-300 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100"
          >
            {isAdmin ? "All Blogs" : "My Blogs"}
          </Link>
        </div>
      </header>

      {error ? <Alert variant="error">{error}</Alert> : null}

      <section aria-label="Statistics" className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-ink-200 bg-white p-5"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
              {stat.label}
            </p>
            <p className="mt-2 text-2xl font-bold capitalize text-ink-900">
              {loading && typeof stat.value === "number" ? "—" : stat.value}
            </p>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <ProfileCard user={user} />
        <RecentBlogs loading={loading} recent={recent} />
      </div>
    </div>
  );
}

/** Profile summary card, fed by the AuthContext profile. */
function ProfileCard({ user }) {
  return (
    <section
      aria-labelledby="profile-info-heading"
      className="rounded-xl border border-ink-200 bg-white p-5 lg:col-span-1"
    >
      <h2
        id="profile-info-heading"
        className="text-sm font-semibold uppercase tracking-wide text-ink-500"
      >
        Profile Information
      </h2>
      <div className="mt-4 flex items-center gap-4">
        <Avatar user={user} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">
            {displayName(user)}
          </p>
          <p className="truncate text-sm text-ink-500">{user?.email}</p>
        </div>
      </div>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">Role</dt>
          <dd className="font-medium capitalize text-ink-800">
            {user?.role || "user"}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-ink-500">Status</dt>
          <dd className="font-medium text-ink-800">
            {user?.isActive === false ? "Inactive" : "Active"}
          </dd>
        </div>
      </dl>
      <Link
        href="/dashboard/profile"
        className="mt-4 inline-block text-sm font-medium text-brand-700 hover:underline"
      >
        Edit profile →
      </Link>
    </section>
  );
}

/** Five most recent blogs in scope (own blogs for users, all for admins). */
function RecentBlogs({ loading, recent }) {
  return (
    <section
      aria-labelledby="recent-blogs-heading"
      className="rounded-xl border border-ink-200 bg-white p-5 lg:col-span-2"
    >
      <h2
        id="recent-blogs-heading"
        className="text-sm font-semibold uppercase tracking-wide text-ink-500"
      >
        Recent Blogs
      </h2>

      {loading ? (
        <Loader label="Loading blogs..." />
      ) : recent.length === 0 ? (
        <EmptyState
          className="mt-4 border-0 px-0 py-6"
          title="You haven't created any blogs yet."
          description="Publish your first blog to see it listed here."
          actionHref="/dashboard/blogs/create"
          actionLabel="Create Blog"
        />
      ) : (
        <ul className="mt-4 divide-y divide-ink-100">
          {recent.map((blog) => (
            <li key={entityId(blog)} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/blogs/${entityId(blog)}`}
                  className="block truncate text-sm font-medium text-ink-800 hover:text-brand-700"
                >
                  {blogTitle(blog)}
                </Link>
                <p className="text-xs text-ink-500">
                  {blog.category || "Uncategorised"} ·{" "}
                  {formatDate(blog.createdAt) || "—"}
                </p>
              </div>
              <Link
                href={`/dashboard/blogs/${entityId(blog)}/edit`}
                className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
