import { useId } from "react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

export function Checkbox({ className, label, description, error, id, ...props }: CheckboxProps) {
  const generatedId = useId();
  const checkboxId = id ?? generatedId;

  return (
    <div className="w-full">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id={checkboxId}
          aria-invalid={!!error}
          className={cn(
            "mt-0.5 size-4 shrink-0 rounded border-zinc-300 text-indigo-600 accent-indigo-600",
            "focus:outline-2 focus:outline-offset-2 focus:outline-indigo-600",
            "dark:border-zinc-700",
            className
          )}
          {...props}
        />
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-sm text-zinc-500 dark:text-zinc-400">{description}</span>
            )}
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
