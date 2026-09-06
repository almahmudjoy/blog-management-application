"use client";

/**
 * Forgot password page (requirement 25) — POST /api/auth/forgot-password.
 */
import { useState } from "react";
import Link from "next/link";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import * as authService from "@/services/auth.service";
import { hasErrors, validateEmailOnly } from "@/utils/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetLink, setResetLink] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    setResetLink("");

    const validationErrors = validateEmailOnly({ email });
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const result = await authService.forgotPassword({ email });
      setSuccess(result.message);
      if (result.resetToken) {
        setResetLink(
          `${window.location.origin}/reset-password/${encodeURIComponent(result.resetToken)}`
        );
      }
      setEmail("");
    } catch (error) {
      setFormError(error?.message || "Unable to send the reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">Forgot password?</h1>
        <p className="mt-1 text-sm text-ink-600">
          Enter your account email and we&apos;ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}
          {success ? <Alert variant="success">{success}</Alert> : null}
          {resetLink ? (
            <Alert variant="info">
              Development reset link: <a href={resetLink}>{resetLink}</a>
            </Alert>
          ) : null}

          <TextField
            id="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setErrors({});
            }}
            error={errors.email}
          />

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            loadingLabel="Sending..."
          >
            Send Reset Link
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-600">
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
