import { useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({ className, label, error, hint, id, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        aria-invalid={!!error}
        className={cn(
          "h-10 w-full rounded-lg border bg-white px-3 text-sm text-zinc-900 shadow-sm",
          "placeholder:text-zinc-400 focus:outline-2 focus:-outline-offset-1",
          "dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500",
          error
            ? "border-red-500 focus:outline-red-500"
            : "border-zinc-300 focus:outline-indigo-600 dark:border-zinc-700",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>
      ) : null}
    </div>
  );
}
