/**
 * Client-side validation helpers (requirement 39).
 * These complement — never replace — backend validation.
 */
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE,
  MIN_PASSWORD_LENGTH,
} from "@/utils/constants";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MAX_PASSWORD_LENGTH = 12;

export function validateRegister({
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
}) {
  const errors = {};
  if (!firstName?.trim()) errors.firstName = "First name is required.";
  if (!lastName?.trim()) errors.lastName = "Last name is required.";

  if (!email?.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email.trim()))
    errors.email = "Enter a valid email address.";

  if (!password) errors.password = "Password is required.";
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  else if (password.length > MAX_PASSWORD_LENGTH)
    errors.password = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;

  if (!confirmPassword) errors.confirmPassword = "Please confirm your password.";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  return errors;
}

export function validateLogin({ email, password }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email.trim()))
    errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  return errors;
}

export function validateEmailOnly({ email }) {
  const errors = {};
  if (!email?.trim()) errors.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(email.trim()))
    errors.email = "Enter a valid email address.";
  return errors;
}

export function validatePasswordPair({ password, confirmPassword }) {
  const errors = {};
  if (!password) errors.password = "New password is required.";
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  else if (password.length > MAX_PASSWORD_LENGTH)
    errors.password = `Password must be at most ${MAX_PASSWORD_LENGTH} characters.`;

  if (!confirmPassword) errors.confirmPassword = "Please confirm the password.";
  else if (password !== confirmPassword)
    errors.confirmPassword = "Passwords do not match.";

  return errors;
}

export function validateProfile({ firstName, lastName }) {
  const errors = {};
  if (!firstName?.trim()) errors.firstName = "First name is required.";
  if (!lastName?.trim()) errors.lastName = "Last name is required.";
  return errors;
}

export function validateBlog({ blogTitle, category, blog }) {
  const errors = {};
  if (!blogTitle?.trim()) errors.blogTitle = "Blog title is required.";
  else if (blogTitle.trim().length < 3)
    errors.blogTitle = "Blog title must be at least 3 characters.";

  if (!category?.trim()) errors.category = "Please choose a category.";

  if (!blog?.trim()) errors.blog = "Blog content is required.";
  else if (blog.trim().length < 20)
    errors.blog = "Blog content must be at least 20 characters.";

  return errors;
}

/** Returns an error string, or "" when the file is acceptable. */
export function validateImageFile(file) {
  if (!file) return "Please choose an image first.";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Unsupported format. Use JPG, PNG or WEBP.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    const mb = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);
    return `Image is too large. Maximum size is ${mb} MB.`;
  }
  return "";
}

export function hasErrors(errors) {
  return Object.keys(errors || {}).length > 0;
}
