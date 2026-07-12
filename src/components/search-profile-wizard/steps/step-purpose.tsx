"use client";

import { useState } from "react";
import { SEARCH_PURPOSES } from "@/lib/search-criteria";
import { stepPurposeSchema, type WizardDraftData } from "@/lib/validations/search-profile";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../wizard";
import { StepFooter } from "./shared";

export function StepPurpose({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const [name, setName] = useState(data.name ?? "");
  const [purpose, setPurpose] = useState<string | undefined>(data.purpose);
  const [nameTouched, setNameTouched] = useState(!!data.name);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>();

  const selectPurpose = (value: string) => {
    setPurpose(value);
    // Suggest a profile name until the user edits it manually.
    if (!nameTouched) {
      const label = SEARCH_PURPOSES.find((p) => p.value === value)?.label;
      if (label) setName(label);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const candidate = { name: name.trim(), purpose };
    const parsed = stepPurposeSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors(undefined);
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-2">
        {SEARCH_PURPOSES.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => selectPurpose(option.value)}
            aria-pressed={purpose === option.value}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors sm:p-4",
              purpose === option.value
                ? "border-indigo-600 bg-indigo-50 dark:border-indigo-500 dark:bg-indigo-950/40"
                : "border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800/50"
            )}
          >
            <span className="block text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {option.label}
            </span>
            <span className="mt-0.5 block text-sm text-zinc-500 dark:text-zinc-400">
              {option.description}
            </span>
          </button>
        ))}
      </div>
      {errors?.purpose && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.purpose[0]}</p>
      )}

      <div className="mt-6">
        <Input
          label="Název profilu"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setNameTouched(true);
          }}
          placeholder="např. Byt pro rodinu v Brně"
          hint="Pod tímto názvem profil najdete ve svém přehledu."
          error={errors?.name?.[0]}
        />
      </div>

      <StepFooter
        onBack={
          onBack
            ? () => onBack({ name, purpose: purpose as WizardDraftData["purpose"] })
            : undefined
        }
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}
