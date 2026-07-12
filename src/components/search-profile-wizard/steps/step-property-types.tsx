"use client";

import { useState } from "react";
import { DESIRED_PROPERTY_TYPES } from "@/lib/search-criteria";
import { stepPropertyTypesSchema, type WizardDraftData } from "@/lib/validations/search-profile";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../wizard";
import { StepFooter } from "./shared";

type PropertyTypeValue = NonNullable<WizardDraftData["propertyTypes"]>[number];

export function StepPropertyTypes({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const [selected, setSelected] = useState<PropertyTypeValue[]>(data.propertyTypes ?? []);
  const [error, setError] = useState<string | null>(null);

  const toggle = (value: PropertyTypeValue) => {
    setSelected((current) =>
      current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    );
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepPropertyTypesSchema.safeParse({ propertyTypes: selected });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Vyberte alespoň jeden typ");
      return;
    }
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {DESIRED_PROPERTY_TYPES.map((type) => {
          const isSelected = selected.includes(type.value);
          return (
            <button
              key={type.value}
              type="button"
              onClick={() => toggle(type.value)}
              aria-pressed={isSelected}
              className={cn(
                "rounded-lg border p-3 text-center text-sm font-medium transition-colors",
                isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
              )}
            >
              {type.label}
            </button>
          );
        })}
      </div>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <StepFooter
        onBack={onBack ? () => onBack({ propertyTypes: selected }) : undefined}
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}
