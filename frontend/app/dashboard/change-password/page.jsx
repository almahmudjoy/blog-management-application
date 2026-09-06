"use client";

/** Change password page (requirement 24) — PATCH /api/users/password. */
import { useState } from "react";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import { useToast } from "@/contexts/ToastContext";
import * as userService from "@/services/user.service";
import { MIN_PASSWORD_LENGTH } from "@/utils/constants";
import { hasErrors, validatePasswordPair } from "@/utils/validation";

export default function ChangePasswordPage() {
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

    // Confirmation is checked before the request is made.
    const validationErrors = validatePasswordPair(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const message = await userService.changePassword({
        password: values.password,
      });
      toast.success(message);
      setValues({ password: "", confirmPassword: "" });
    } catch (error) {
      setFormError(error?.message || "Unable to change the password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Change Password</h1>
        <p className="mt-1 text-sm text-ink-600">
          Choose a strong password you don&apos;t use anywhere else.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-ink-200 bg-white p-6"
        noValidate
      >
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
          label="Confirm New Password"
          type="password"
          required
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          loading={submitting}
          loadingLabel="Updating..."
          className="w-full"
        >
          Change Password
        </Button>
      </form>
    </div>
  );
}
