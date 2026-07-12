"use client";

import { useState } from "react";
import { FEATURE_FLAG_CRITERIA, FEATURE_SELECT_CRITERIA } from "@/lib/search-criteria";
import { stepFeaturesSchema, type StepFeaturesInput } from "@/lib/validations/search-profile";
import { Checkbox, Select } from "@/components/ui";
import type { WizardStepProps } from "../wizard";
import { StepFooter } from "./shared";

export function StepFeatures({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const [ownership, setOwnership] = useState(data.ownership ?? "ANY");
  const [condition, setCondition] = useState(data.condition ?? "ANY");
  const [floor, setFloor] = useState(data.floor ?? "ANY");
  const [energyClass, setEnergyClass] = useState(data.energyClass ?? "ANY");
  const [features, setFeatures] = useState<string[]>(data.features ?? []);
  const [error, setError] = useState<string | null>(null);

  const selectState: Record<string, [string, (v: string) => void]> = {
    ownership: [ownership, (v) => setOwnership(v as StepFeaturesInput["ownership"])],
    condition: [condition, (v) => setCondition(v as StepFeaturesInput["condition"])],
    floor: [floor, (v) => setFloor(v as StepFeaturesInput["floor"])],
    energy_class: [energyClass, (v) => setEnergyClass(v as StepFeaturesInput["energyClass"])],
  };

  const toggleFeature = (key: string) => {
    setFeatures((current) =>
      current.includes(key) ? current.filter((f) => f !== key) : [...current, key]
    );
  };

  const buildCandidate = () => ({ ownership, condition, floor, energyClass, features });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepFeaturesSchema.safeParse(buildCandidate());
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Zkontrolujte vyplněné údaje");
      return;
    }
    setError(null);
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURE_SELECT_CRITERIA.map((criterion) => {
            const [value, setValue] = selectState[criterion.key];
            return (
              <Select
                key={criterion.key}
                label={criterion.label}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                options={criterion.options}
              />
            );
          })}
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Požadované vybavení
          </p>
          <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">
            Zaškrtněte, co by nemovitost měla mít.
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {FEATURE_FLAG_CRITERIA.map((criterion) => (
              <Checkbox
                key={criterion.key}
                label={criterion.label}
                checked={features.includes(criterion.key)}
                onChange={() => toggleFeature(criterion.key)}
              />
            ))}
          </div>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <StepFooter
        onBack={onBack ? () => onBack(buildCandidate()) : undefined}
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}
