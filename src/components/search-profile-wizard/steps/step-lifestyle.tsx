"use client";

import { useState } from "react";
import { LIFESTYLE_CRITERIA } from "@/lib/search-criteria";
import { stepLifestyleSchema } from "@/lib/validations/search-profile";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../wizard";
import { StepFooter } from "./shared";

export function StepLifestyle({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const [lifestyle, setLifestyle] = useState<string[]>(data.lifestyle ?? []);

  const toggle = (key: string) => {
    setLifestyle((current) =>
      current.includes(key) ? current.filter((k) => k !== key) : [...current, key]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepLifestyleSchema.safeParse({ lifestyle });
    if (!parsed.success) return;
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {LIFESTYLE_CRITERIA.map((criterion) => {
          const isSelected = lifestyle.includes(criterion.key);
          return (
            <button
              key={criterion.key}
              type="button"
              onClick={() => toggle(criterion.key)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-lg border p-3 text-center text-sm font-medium transition-colors",
                isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
              )}
            >
              {criterion.label}
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Vyberte vše, co je pro vás v okolí bydlení důležité. Důležitost jednotlivých kritérií
        upřesníte v dalším kroku.
      </p>

      <StepFooter
        onBack={onBack ? () => onBack({ lifestyle }) : undefined}
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}
