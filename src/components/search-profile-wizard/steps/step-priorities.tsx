"use client";

import { useState } from "react";
import {
  DEFAULT_PRIORITY_LEVEL,
  FEATURE_SELECT_CRITERIA,
  PRIORITY_LEVELS,
  criterionLabel,
  preferenceValueLabel,
  type PriorityLevel,
} from "@/lib/search-criteria";
import { stepPrioritiesSchema } from "@/lib/validations/search-profile";
import { Alert } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../wizard";
import { StepFooter } from "./shared";

/** Criteria the user actually picked in steps 6 & 7 — the ones worth prioritizing. */
function collectSelectedCriteria(data: WizardStepProps["data"]): { key: string; value: string }[] {
  const result: { key: string; value: string }[] = [];

  for (const criterion of FEATURE_SELECT_CRITERIA) {
    const value =
      criterion.key === "energy_class"
        ? data.energyClass
        : (data[criterion.key as "ownership" | "condition" | "floor"] as string | undefined);
    if (value && value !== criterion.anyValue) {
      result.push({ key: criterion.key, value });
    }
  }
  for (const key of data.features ?? []) result.push({ key, value: "true" });
  for (const key of data.lifestyle ?? []) result.push({ key, value: "true" });

  return result;
}

export function StepPriorities({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const criteria = collectSelectedCriteria(data);
  const [priorities, setPriorities] = useState<Record<string, PriorityLevel>>(() => {
    const initial: Record<string, PriorityLevel> = {};
    for (const { key } of criteria) {
      initial[key] = data.priorities?.[key] ?? DEFAULT_PRIORITY_LEVEL;
    }
    return initial;
  });

  const setLevel = (key: string, level: PriorityLevel) => {
    setPriorities((current) => ({ ...current, [key]: level }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepPrioritiesSchema.safeParse({ priorities });
    if (!parsed.success) return;
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {criteria.length === 0 ? (
        <Alert variant="info">
          V předchozích krocích jste nevybrali žádná kritéria — profil můžete dokončit rovnou a
          kritéria doplnit později v úpravě profilu.
        </Alert>
      ) : (
        <div className="flex flex-col gap-5">
          {criteria.map(({ key, value }) => (
            <div key={key}>
              <p className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {criterionLabel(key)}
                {value !== "true" && (
                  <span className="ml-1.5 font-normal text-zinc-500 dark:text-zinc-400">
                    ({preferenceValueLabel(key, value)})
                  </span>
                )}
              </p>
              <div
                role="radiogroup"
                aria-label={`Priorita: ${criterionLabel(key)}`}
                className="grid grid-cols-2 gap-1.5 sm:grid-cols-5"
              >
                {PRIORITY_LEVELS.map((level) => {
                  const isSelected = priorities[key] === level.value;
                  return (
                    <button
                      key={level.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setLevel(key, level.value)}
                      className={cn(
                        "rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors sm:text-[13px]",
                        isSelected
                          ? level.value === "MUST_HAVE"
                            ? "border-red-600 bg-red-50 text-red-900 dark:border-red-500 dark:bg-red-950/40 dark:text-red-200"
                            : "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                          : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
                      )}
                    >
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            <strong>Nezbytné</strong> — nabídky bez tohoto kritéria vyřadíme. Ostatní úrovně
            ovlivňují váhu kritéria při hodnocení shody.
          </p>
        </div>
      )}

      <StepFooter
        onBack={onBack ? () => onBack({ priorities }) : undefined}
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}
