"use client";

/** Debounced blog search input (requirement 6). */
import { useEffect, useState } from "react";

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search blogs...",
  delay = 400,
  className = "",
  id = "blog-search",
}) {
  const [text, setText] = useState(value || "");

  // Keep the local field in sync when the parent resets the filter.
  useEffect(() => {
    setText(value || "");
  }, [value]);

  // Debounce so typing does not fire one request per keystroke.
  useEffect(() => {
    if (text === (value || "")) return undefined;
    const timer = setTimeout(() => onChange(text), delay);
    return () => clearTimeout(timer);
  }, [text, value, delay, onChange]);

  return (
    <div className={`relative ${className}`}>
      <label htmlFor={id} className="sr-only">
        Search blogs
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </span>
      <input
        id={id}
        type="search"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm text-ink-800 shadow-sm transition placeholder:text-ink-400 focus:border-brand-400"
      />
    </div>
  );
}
