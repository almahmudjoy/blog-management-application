"use client";

/**
 * Accessible form field primitives.
 * Each control is wired to its label via id, and to its error text via
 * aria-describedby + aria-invalid so validation is announced to screen readers.
 */
const BASE_CONTROL =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-ink-800 placeholder:text-ink-400 disabled:bg-ink-100 disabled:text-ink-500";

function controlClass(error) {
  return `${BASE_CONTROL} ${error ? "border-red-400" : "border-ink-300"}`;
}

function FieldShell({ id, label, error, hint, required, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink-700">
        {label}
        {required ? (
          <span className="ml-0.5 text-red-600" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  required = false,
  className = "",
  ...rest
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        id={id}
        name={rest.name || id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`${controlClass(error)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  required = false,
  rows = 10,
  className = "",
  ...rest
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <textarea
        id={id}
        name={rest.name || id}
        rows={rows}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`${controlClass(error)} ${className}`}
        {...rest}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  error,
  hint,
  required = false,
  options = [],
  placeholder,
  className = "",
  ...rest
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        id={id}
        name={rest.name || id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        className={`${controlClass(error)} ${className}`}
        {...rest}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const value = typeof option === "string" ? option : option.value;
          const text = typeof option === "string" ? option : option.label;
          return (
            <option key={value} value={value}>
              {text}
            </option>
          );
        })}
      </select>
    </FieldShell>
  );
}
