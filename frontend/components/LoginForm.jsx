"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import * as authService from "@/services/auth.service";
import { hasErrors, validateLogin } from "@/utils/validation";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, establishSession } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({ email: "", password: "", otp: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [devOtp, setDevOtp] = useState("");

  const nextPath = searchParams.get("next");
  const resetRequested = searchParams.get("reset") === "1";

  useEffect(() => {
    if (!resetRequested) return;
    setOtpRequired(false);
    setDevOtp("");
    setValues({ email: "", password: "", otp: "" });
    setErrors({});
    setFormError("");
  }, [resetRequested]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function completeLogin(token, user) {
    try {
      const resolvedUser = await establishSession(token, user);
      toast.success(`Welcome back, ${resolvedUser?.firstName || "there"}!`);
      const target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      router.replace(target);
    } catch (error) {
      setFormError(error?.message || "Unable to load your profile.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const validationErrors = otpRequired
      ? values.otp.trim()
        ? {}
        : { otp: "OTP is required." }
      : validateLogin(values);

    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      if (otpRequired) {
        const result = await authService.verifyOtp({
          email: values.email,
          otp: values.otp,
        });
        await completeLogin(result.token, result.user);
        return;
      }

      const result = await authService.login(values);
      if (result?.requiresOtp) {
        setOtpRequired(true);
        setDevOtp(result.devOtp || "");
        toast.success(result.message || "OTP sent to your email.");
        if (result.devOtp) {
          toast.success(`Development OTP: ${result.devOtp}`);
        }
        return;
      }

      const user = await login(values);
      toast.success(`Welcome back, ${user?.firstName || "there"}!`);
      const target =
        nextPath && nextPath.startsWith("/") && !nextPath.startsWith("//")
          ? nextPath
          : "/dashboard";
      router.replace(target);
    } catch (error) {
      setFormError(error?.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResendOtp() {
    setFormError("");
    setResending(true);

    try {
      const result = await authService.login(values);
      setValues((current) => ({ ...current, otp: "" }));
      setDevOtp(result.devOtp || "");
      toast.success(result.message || "A new OTP was sent to your email.");
    } catch (error) {
      setFormError(error?.message || "Unable to resend the OTP.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-2xl border border-ink-200 bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900">
          {otpRequired ? "Verify OTP" : "Login"}
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          {otpRequired
            ? "Enter the one-time code sent to your email to finish signing in."
            : "Sign in to manage your blogs and profile."}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          {!otpRequired ? (
            <>
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
            </>
          ) : (
            <>
              <TextField
                id="otp"
                label="OTP"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={values.otp}
                onChange={handleChange}
                error={errors.otp}
              />
              {devOtp ? (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                  Development OTP: <strong>{devOtp}</strong>
                </div>
              ) : null}
            </>
          )}

          {!otpRequired && (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={submitting}
            loadingLabel={otpRequired ? "Verifying..." : "Signing in..."}
          >
            {otpRequired ? "Verify OTP" : "Login"}
          </Button>

          {otpRequired ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              loading={resending}
              loadingLabel="Resending..."
              onClick={handleResendOtp}
            >
              Resend OTP
            </Button>
          ) : null}
        </form>

        {otpRequired ? (
          <button
            type="button"
            onClick={() => {
              setOtpRequired(false);
              setDevOtp("");
              setValues((current) => ({ ...current, otp: "" }));
              setErrors({});
              setFormError("");
            }}
            className="mt-4 text-sm font-medium text-brand-700 hover:underline"
          >
            Back to login
          </button>
        ) : (
          <p className="mt-6 text-sm text-ink-600">
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-brand-700 hover:underline"
            >
              Create an account
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
