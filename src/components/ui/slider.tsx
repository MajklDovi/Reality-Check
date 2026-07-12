"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
  /** Render the current value next to the label. */
  showValue?: boolean;
  /** Format the displayed value (e.g. add units). */
  formatValue?: (value: number) => string;
}

export function Slider({
  className,
  label,
  showValue = true,
  formatValue,
  id,
  value,
  defaultValue,
  ...props
}: SliderProps) {
  const generatedId = useId();
  const sliderId = id ?? generatedId;
  const current = Number(value ?? defaultValue ?? 0);
  const display = formatValue ? formatValue(current) : String(current);

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <label
              htmlFor={sliderId}
              className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              {label}
            </label>
          )}
          {showValue && (
            <span className="text-sm text-zinc-500 tabular-nums dark:text-zinc-400">{display}</span>
          )}
        </div>
      )}
      <input
        type="range"
        id={sliderId}
        value={value}
        defaultValue={defaultValue}
        className={cn(
          "h-2 w-full cursor-pointer appearance-none rounded-full bg-zinc-200 accent-indigo-600 dark:bg-zinc-700",
          className
        )}
        {...props}
      />
    </div>
  );
}
