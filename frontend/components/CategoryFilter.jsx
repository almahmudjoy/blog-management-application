"use client";

/** Category filter chips / select (requirement 7). */
import { ALL_CATEGORIES, BLOG_CATEGORIES } from "@/utils/constants";

export default function CategoryFilter({
  value = ALL_CATEGORIES,
  onChange,
  categories = BLOG_CATEGORIES,
  className = "",
}) {
  const options = [{ value: ALL_CATEGORIES, label: "All" }].concat(
    categories.map((category) => ({ value: category, label: category }))
  );

  return (
    <div className={className}>
      {/* Mobile: a compact native select keeps the toolbar usable. */}
      <div className="sm:hidden">
        <label htmlFor="category-filter" className="sr-only">
          Filter blogs by category
        </label>
        <select
          id="category-filter"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm shadow-sm"
        >
          {options.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop: chip buttons in a radio group. */}
      <div
        role="radiogroup"
        aria-label="Filter blogs by category"
        className="hidden flex-wrap gap-2 sm:flex"
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.label}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? "border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/20"
                  : "border-ink-200 bg-white text-ink-600 shadow-sm hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
