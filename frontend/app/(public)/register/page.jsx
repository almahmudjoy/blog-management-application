"use client";

/** Registration page (requirement 10) — POST /api/auth/register. */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import { useToast } from "@/contexts/ToastContext";
import * as authService from "@/services/auth.service";
import { MIN_PASSWORD_LENGTH } from "@/utils/constants";
import { hasErrors, validateRegister } from "@/utils/validation";

const EMPTY = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [values, setValues] = useState(EMPTY);
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

    const validationErrors = validateRegister(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const { message } = await authService.register(values);
      toast.success(message);
      router.push("/login");
    } catch (error) {
      setFormError(error?.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-600">
          Register to publish and manage your own blogs.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="firstName"
              label="First Name"
              required
              autoComplete="given-name"
              value={values.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <TextField
              id="lastName"
              label="Last Name"
              required
              autoComplete="family-name"
              value={values.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>

          <TextField
            id="email"
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
          />

          <TextField
            id="password"
            label="Password"
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
            loadingLabel="Registering..."
          >
            Register
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-brand-700 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
