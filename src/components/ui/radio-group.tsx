"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function RadioGroup({
  name,
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  error,
  className,
}: RadioGroupProps) {
  const groupId = useId();

  return (
    <fieldset className={cn("w-full", className)}>
      {label && (
        <legend className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {label}
        </legend>
      )}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={optionId}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50",
                "has-checked:border-indigo-600 has-checked:bg-indigo-50 dark:has-checked:bg-indigo-950/30",
                option.disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                id={optionId}
                name={name}
                value={option.value}
                checked={value !== undefined ? value === option.value : undefined}
                defaultChecked={
                  defaultValue !== undefined ? defaultValue === option.value : undefined
                }
                disabled={option.disabled}
                onChange={(e) => onValueChange?.(e.target.value)}
                className="mt-0.5 size-4 shrink-0 accent-indigo-600"
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {option.description}
                  </span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </fieldset>
  );
}
