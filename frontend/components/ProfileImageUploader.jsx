"use client";

/**
 * Profile image upload (requirement 22) — PATCH /api/users/profile/image with
 * multipart/form-data, field name "image".
 *
 * The backend stores the file and saves the path in `users.profileImage`; this
 * component validates the file first (type + size, matching the backend's own
 * constraints) and re-reads the profile afterwards so the navbar avatar updates
 * immediately, with no logout/login required.
 */
import { useEffect, useRef, useState } from "react";
import Alert from "@/components/Alert";
import Avatar from "@/components/Avatar";
import Button from "@/components/Button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import * as userService from "@/services/user.service";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/utils/constants";
import { validateImageFile } from "@/utils/validation";

export default function ProfileImageUploader() {
  const { user, refreshProfile } = useAuth();
  const toast = useToast();
  const inputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function handleSelect(event) {
    const selected = event.target.files?.[0] || null;
    setError("");

    if (!selected) {
      setFile(null);
      setPreview("");
      return;
    }

    const validationError = validateImageFile(selected);
    if (validationError) {
      setError(validationError);
      setFile(null);
      setPreview("");
      event.target.value = "";
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  async function handleUpload() {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);
    setError("");
    try {
      const message = await userService.uploadProfileImage(file);
      // The endpoint returns a message only, so re-read the canonical profile
      // to pick up the new image URL and refresh the navbar avatar.
      await refreshProfile();

      toast.success(message);
      setFile(null);
      setPreview("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (uploadError) {
      setError(uploadError?.message || "Unable to upload the image.");
    } finally {
      setUploading(false);
    }
  }

  const maxMb = (MAX_IMAGE_SIZE / (1024 * 1024)).toFixed(0);

  return (
    <section
      aria-labelledby="avatar-heading"
      className="rounded-2xl border border-ink-200 bg-white p-6"
    >
      <h2 id="avatar-heading" className="text-lg font-semibold text-ink-900">
        Profile Image
      </h2>
      <p className="mt-1 text-sm text-ink-600">
        JPG, PNG or WEBP up to {maxMb} MB.
      </p>

      <div className="mt-5 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Selected profile image preview"
            className="h-24 w-24 rounded-full border border-ink-200 object-cover"
          />
        ) : (
          <Avatar user={user} size="xl" />
        )}

        <div className="w-full space-y-3">
          <div>
            <label
              htmlFor="profile-image"
              className="mb-1 block text-sm font-medium text-ink-700"
            >
              Choose Image
            </label>
            <input
              ref={inputRef}
              id="profile-image"
              name="image"
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              onChange={handleSelect}
              className="block w-full cursor-pointer rounded-lg border border-ink-300 bg-white text-sm text-ink-700 file:mr-3 file:cursor-pointer file:rounded-l-lg file:border-0 file:bg-ink-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-ink-700"
            />
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <Button
            onClick={handleUpload}
            disabled={!file}
            loading={uploading}
            loadingLabel="Uploading..."
          >
            Upload
          </Button>
        </div>
      </div>
    </section>
  );
}
