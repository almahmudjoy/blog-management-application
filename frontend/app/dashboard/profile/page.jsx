"use client";

/**
 * Profile page (requirements 20-22).
 * - Reads the profile from AuthContext, which is populated by
 *   GET /api/users/profile (and refreshed on mount for the latest values).
 * - Editing first/last name calls PUT /api/users/profile/update.
 * - Email is read-only, and there are deliberately no controls for `role` or
 *   `isActive` (requirement 21/42).
 */
import { useEffect, useState } from "react";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import { TextField } from "@/components/FormFields";
import Loader from "@/components/Loader";
import ProfileImageUploader from "@/components/ProfileImageUploader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import * as userService from "@/services/user.service";
import { formatDate } from "@/utils/format";
import { hasErrors, validateProfile } from "@/utils/validation";

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();

  const [values, setValues] = useState({ firstName: "", lastName: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Pull the latest profile once when the page opens.
  useEffect(() => {
    refreshProfile().catch(() => {
      /* AuthContext already handles invalid sessions */
    });
  }, [refreshProfile]);

  // Keep the form in sync with the loaded profile.
  useEffect(() => {
    if (!user) return;
    setValues({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
    });
  }, [user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    const validationErrors = validateProfile(values);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSaving(true);
    try {
      const message = await userService.updateProfile(values);
      // Message-only response: re-read the profile so the navbar and this form
      // both show the saved values.
      await refreshProfile();
      toast.success(message);
    } catch (error) {
      setFormError(error?.message || "Unable to update the profile.");
    } finally {
      setSaving(false);
    }
  }

  if (!user) return <Loader label="Loading profile..." />;

  const joined = formatDate(user.createdAt);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-ink-900">Profile</h1>
        <p className="mt-1 text-sm text-ink-600">
          Update your details and profile image.
        </p>
      </header>

      <ProfileImageUploader />

      <section
        aria-labelledby="account-heading"
        className="rounded-2xl border border-ink-200 bg-white p-6"
      >
        <h2 id="account-heading" className="text-lg font-semibold text-ink-900">
          Account Details
        </h2>

        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-500">
              Role
            </dt>
            <dd className="mt-1 text-sm font-medium capitalize text-ink-800">
              {user.role || "user"}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-ink-500">
              Status
            </dt>
            <dd className="mt-1 text-sm font-medium text-ink-800">
              {user.isActive === false ? "Inactive" : "Active"}
            </dd>
          </div>
          {joined ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-ink-500">
                Member Since
              </dt>
              <dd className="mt-1 text-sm font-medium text-ink-800">{joined}</dd>
            </div>
          ) : null}
        </dl>

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
            value={user.email || ""}
            readOnly
            disabled
            hint="Email cannot be changed."
          />

          <Button type="submit" loading={saving} loadingLabel="Saving...">
            Save Changes
          </Button>
        </form>
      </section>
    </div>
  );
}
