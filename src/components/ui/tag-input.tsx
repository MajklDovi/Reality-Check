"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

export interface TagInputProps {
  label?: string;
  hint?: string;
  error?: string;
  placeholder?: string;
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
  className?: string;
}

/** Free-text chips input — Enter or comma adds a tag. */
export function TagInput({
  label,
  hint,
  error,
  placeholder,
  value,
  onChange,
  maxTags = 30,
  className,
}: TagInputProps) {
  const inputId = useId();
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/,+$/, "").trim();
    if (!tag) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (value.length >= maxTags) return;
    onChange([...value, tag]);
    setDraft("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      <div
        className={cn(
          "flex min-h-10 w-full flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 shadow-sm",
          "focus-within:outline-2 focus-within:-outline-offset-1",
          "dark:bg-zinc-900",
          error
            ? "border-red-500 focus-within:outline-red-500"
            : "border-zinc-300 focus-within:outline-indigo-600 dark:border-zinc-700"
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-indigo-100 py-0.5 pr-1 pl-2.5 text-sm text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              aria-label={`Odebrat ${tag}`}
              className="flex size-4 items-center justify-center rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900"
            >
              <svg className="size-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          id={inputId}
          type="text"
          value={draft}
          placeholder={value.length === 0 ? placeholder : undefined}
          onChange={(e) => {
            const next = e.target.value;
            if (next.endsWith(",")) {
              addTag(next);
            } else {
              setDraft(next);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(draft);
            } else if (e.key === "Backspace" && !draft && value.length > 0) {
              removeTag(value[value.length - 1]);
            }
          }}
          onBlur={() => addTag(draft)}
          className="min-w-24 flex-1 bg-transparent px-1 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
        />
      </div>
      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
