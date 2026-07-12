"use client";

import { useState } from "react";
import { DISPOSITIONS } from "@/lib/search-criteria";
import { stepSizeSchema, type WizardDraftData } from "@/lib/validations/search-profile";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../wizard";
import { StepFooter, fieldError, numberToInput, parseNumberInput } from "./shared";

type DispositionValue = NonNullable<WizardDraftData["dispositions"]>[number];

export function StepSize({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const [minArea, setMinArea] = useState(numberToInput(data.minimumArea));
  const [maxArea, setMaxArea] = useState(numberToInput(data.maximumArea));
  const [minRooms, setMinRooms] = useState(numberToInput(data.minimumRooms));
  const [maxRooms, setMaxRooms] = useState(numberToInput(data.maximumRooms));
  const [dispositions, setDispositions] = useState<DispositionValue[]>(data.dispositions ?? []);
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>();

  const toggleDisposition = (value: DispositionValue) => {
    setDispositions((current) =>
      current.includes(value) ? current.filter((d) => d !== value) : [...current, value]
    );
  };

  const buildCandidate = () => ({
    minimumArea: parseNumberInput(minArea),
    maximumArea: parseNumberInput(maxArea),
    dispositions,
    minimumRooms: parseNumberInput(minRooms),
    maximumRooms: parseNumberInput(maxRooms),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepSizeSchema.safeParse(buildCandidate());
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors(undefined);
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex flex-col gap-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Minimální výměra (m²)"
            inputMode="numeric"
            placeholder="např. 60"
            value={minArea}
            onChange={(e) => setMinArea(e.target.value)}
            error={fieldError(errors, "minimumArea")}
          />
          <Input
            label="Maximální výměra (m²)"
            inputMode="numeric"
            placeholder="např. 95"
            value={maxArea}
            onChange={(e) => setMaxArea(e.target.value)}
            error={fieldError(errors, "maximumArea")}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Požadované dispozice
          </p>
          <p className="mb-2 text-sm text-zinc-500 dark:text-zinc-400">
            Nechte prázdné, pokud na dispozici nezáleží (např. u pozemků).
          </p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {DISPOSITIONS.map((disposition) => {
              const isSelected = dispositions.includes(disposition.value);
              return (
                <button
                  key={disposition.value}
                  type="button"
                  onClick={() => toggleDisposition(disposition.value)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-lg border px-2 py-2 text-center text-sm font-medium transition-colors",
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {disposition.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Minimální počet pokojů"
            inputMode="numeric"
            placeholder="např. 3"
            value={minRooms}
            onChange={(e) => setMinRooms(e.target.value)}
            error={fieldError(errors, "minimumRooms")}
          />
          <Input
            label="Maximální počet pokojů"
            inputMode="numeric"
            placeholder="např. 4"
            value={maxRooms}
            onChange={(e) => setMaxRooms(e.target.value)}
            error={fieldError(errors, "maximumRooms")}
          />
        </div>
      </div>

      <StepFooter
        onBack={
          onBack
            ? () => {
                const candidate = buildCandidate();
                for (const key of [
                  "minimumArea",
                  "maximumArea",
                  "minimumRooms",
                  "maximumRooms",
                ] as const) {
                  if (Number.isNaN(candidate[key])) candidate[key] = undefined;
                }
                onBack(candidate);
              }
            : undefined
        }
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}
