"use client";

import { initials as userInitials, displayName } from "@/utils/auth";
import { resolveImageUrl } from "@/utils/format";

const SIZES = {
  xs: "h-7 w-7 text-[11px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
};

/**
 * Profile avatar with a graceful fallback to initials when the user has no
 * image (requirement 3).
 *
 * The image value comes from `users.profileImage`, set by
 * PATCH /api/users/profile/image and exposed on GET /api/users/profile
 * (and on the author embedded in the blog list). Without an image the avatar
 * renders as initials.
 *
 * Plain <img> is used instead of next/image because avatars are served from an
 * arbitrary backend origin that is only known at runtime via env vars.
 */
export default function Avatar({ user, image, size = "sm", className = "" }) {
  const src = resolveImageUrl(image ?? user?.profileImage);
  const name = displayName(user) || "User";
  const sizeClass = SIZES[size] || SIZES.sm;

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={`${name}'s profile image`}
        className={`${sizeClass} shrink-0 rounded-full border border-ink-200 object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`${sizeClass} inline-flex shrink-0 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700 ${className}`}
      title={name}
    >
      {userInitials(user)}
    </span>
  );
}
