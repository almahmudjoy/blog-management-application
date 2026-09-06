/**
 * Application-wide constants.
 *
 * NOTE: the category list is a UI *filter vocabulary* (the assignment lists
 * these exact options). It is not blog data — every blog shown in the app is
 * fetched from the REST API.
 */
export const BLOG_CATEGORIES = [
  "Testing",
  "Automation",
  "Programming",
  "DevOps",
  "AI",
];

/** Value used by the "All" option of the category filter (means: no filter). */
export const ALL_CATEGORIES = "";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

/**
 * Accepted profile-image mime types.
 * Must stay in sync with the backend's multer fileFilter
 * (backend/middleware/uploadMiddleware.js): JPG/JPEG/PNG/WEBP only, no GIF.
 */
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

/** Max profile-image size in bytes (2 MB). */
export const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

/** Password bounds enforced on the client (backend also validates). */
export const MIN_PASSWORD_LENGTH = 6;
