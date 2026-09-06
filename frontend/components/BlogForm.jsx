"use client";

/**
 * Reusable create/edit blog form (requirements 16 & 18).
 * The parent supplies `onSubmit` — this component owns validation and the
 * pending state only, so it works unchanged for both create and update.
 */
import { useState } from "react";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { SelectField, TextAreaField, TextField } from "@/components/FormFields";
import { BLOG_CATEGORIES } from "@/utils/constants";
import { hasErrors, validateBlog } from "@/utils/validation";

export default function BlogForm({
  initialValues,
  onSubmit,
  submitLabel = "Publish Blog",
  pendingLabel = "Publishing...",
  onCancel,
}) {
  const [values, setValues] = useState({
    blogTitle: initialValues?.blogTitle || "",
    category: initialValues?.category || "",
    blog: initialValues?.blog || "",
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const validationErrors = validateBlog(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      setFormError(error?.message || "Unable to save the blog.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {formError ? <Alert variant="error">{formError}</Alert> : null}

      <TextField
        id="blogTitle"
        label="Blog Title"
        required
        value={values.blogTitle}
        onChange={handleChange}
        error={errors.blogTitle}
        placeholder="Introduction to Playwright"
        maxLength={160}
      />

      <SelectField
        id="category"
        label="Category"
        required
        value={values.category}
        onChange={handleChange}
        error={errors.category}
        placeholder="Select a category"
        options={BLOG_CATEGORIES}
      />

      <TextAreaField
        id="blog"
        label="Blog Content"
        required
        rows={12}
        value={values.blog}
        onChange={handleChange}
        error={errors.blog}
        hint="Minimum 20 characters."
        placeholder="Playwright is a modern browser automation framework..."
      />

      <div className="flex flex-col-reverse gap-2 sm:flex-row">
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel} disabled={submitting}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={submitting} loadingLabel={pendingLabel}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
