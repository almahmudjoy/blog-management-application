"use client";

/**
 * Login page (requirement 11) — POST /api/auth/login.
 * On success AuthContext stores the token and loads GET /api/users/profile,
 * then the user is sent to `?next=` (protected route they came from) or
 * /dashboard.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { hasErrors, validateLogin } from "@/utils/validation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const nextPath = searchParams.get("next");

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user?.firstName || "there"}!`);
      // Only allow internal redirects.
      const target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      router.replace(target);
    } catch (error) {
      setFormError(error?.message || "Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">Login</h1>
        <p className="mt-1 text-sm text-ink-600">
          Sign in to manage your blogs and profile.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

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
            autoComplete="current-password"
            value={values.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            loadingLabel="Signing in..."
          >
            Login
          </Button>
        </form>

        <p className="mt-6 text-sm text-ink-600">
          New here?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-700 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
