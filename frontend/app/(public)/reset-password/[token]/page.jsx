"use client";

/**
 * Reset password page (requirement 26) — /reset-password/[token].
 * Calls PATCH /api/auth/reset-password/:token then redirects to /login.
 */
import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import { useToast } from "@/contexts/ToastContext";
import * as authService from "@/services/auth.service";
import { MIN_PASSWORD_LENGTH } from "@/utils/constants";
import { hasErrors, validatePasswordPair } from "@/utils/validation";

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();
  const toast = useToast();

  const [values, setValues] = useState({ password: "", confirmPassword: "" });
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

    const validationErrors = validatePasswordPair(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const message = await authService.resetPassword({
        token: Array.isArray(token) ? token[0] : token,
        password: values.password,
      });
      toast.success(message || "Password successfully changed.");
      router.replace("/login");
    } catch (error) {
      setFormError(
        error?.message ||
          "This reset link is invalid or has expired. Please request a new one."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">Reset password</h1>
        <p className="mt-1 text-sm text-ink-600">
          Choose a new password for your account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <TextField
            id="password"
            label="New Password"
            type="password"
            required
            autoComplete="new-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
            hint={`At least ${MIN_PASSWORD_LENGTH} characters.`}
          />

          <TextField
            id="confirmPassword"
            label="Confirm Password"
            type="password"
            required
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
          />

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            loadingLabel="Resetting..."
          >
            Reset Password
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-600">
          <Link
            href="/forgot-password"
            className="font-medium text-brand-700 hover:underline"
          >
            Request a new link
          </Link>
        </p>
      </div>
    </div>
  );
}
