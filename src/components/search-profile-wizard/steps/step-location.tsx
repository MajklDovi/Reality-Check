"use client";

import { useState } from "react";
import { TRANSPORT_MODES } from "@/lib/search-criteria";
import { stepLocationSchema, type WizardDraftData } from "@/lib/validations/search-profile";
import { Input, Select, TagInput } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { WizardStepProps } from "../wizard";
import { StepFooter, fieldError, numberToInput, parseNumberInput } from "./shared";

export function StepLocation({
  data,
  onNext,
  onBack,
  isSubmitting,
  isLast,
  regions,
}: WizardStepProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>(data.preferredRegions ?? []);
  const [cities, setCities] = useState<string[]>(data.preferredCities ?? []);
  const [cityParts, setCityParts] = useState<string[]>(data.preferredCityParts ?? []);
  const [excluded, setExcluded] = useState<string[]>(data.excludedLocations ?? []);
  const [commuteDestination, setCommuteDestination] = useState(data.commuteDestination ?? "");
  const [commuteMinutes, setCommuteMinutes] = useState(numberToInput(data.maximumCommuteMinutes));
  const [transportMode, setTransportMode] = useState<string>(data.transportMode ?? "");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>();

  const toggleRegion = (name: string) => {
    setSelectedRegions((current) =>
      current.includes(name) ? current.filter((r) => r !== name) : [...current, name]
    );
    setErrors(undefined);
  };

  const buildCandidate = () => ({
    preferredRegions: selectedRegions,
    preferredCities: cities,
    preferredCityParts: cityParts,
    excludedLocations: excluded,
    commuteDestination: commuteDestination.trim(),
    maximumCommuteMinutes: parseNumberInput(commuteMinutes),
    transportMode: transportMode as WizardDraftData["transportMode"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepLocationSchema.safeParse(buildCandidate());
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
        <div>
          <p className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Preferované kraje
          </p>
          <div className="flex flex-wrap gap-2">
            {regions.map((region) => {
              const isSelected = selectedRegions.includes(region);
              return (
                <button
                  key={region}
                  type="button"
                  onClick={() => toggleRegion(region)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                      : "border-zinc-300 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/50"
                  )}
                >
                  {region}
                </button>
              );
            })}
          </div>
          {fieldError(errors, "preferredRegions") && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {fieldError(errors, "preferredRegions")}
            </p>
          )}
        </div>

        <TagInput
          label="Preferovaná města"
          placeholder="např. Brno — potvrďte Enterem"
          hint="Zadejte město a potvrďte Enterem. Stačí kraj nebo alespoň jedno město."
          value={cities}
          onChange={(v) => {
            setCities(v);
            setErrors(undefined);
          }}
        />

        <TagInput
          label="Preferované městské části"
          placeholder="např. Královo Pole"
          value={cityParts}
          onChange={setCityParts}
        />

        <TagInput
          label="Vyloučené lokality"
          placeholder="např. Brno-jih"
          hint="Nabídky z těchto lokalit vyřadíme."
          value={excluded}
          onChange={setExcluded}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            label="Cíl dojíždění"
            placeholder="např. Brno, Veveří"
            hint="Práce, škola…"
            value={commuteDestination}
            onChange={(e) => setCommuteDestination(e.target.value)}
            error={fieldError(errors, "commuteDestination")}
          />
          <Input
            label="Max. čas dojíždění (min)"
            inputMode="numeric"
            placeholder="např. 30"
            value={commuteMinutes}
            onChange={(e) => setCommuteMinutes(e.target.value)}
            error={fieldError(errors, "maximumCommuteMinutes")}
          />
          <Select
            label="Způsob dopravy"
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
            options={[
              { value: "", label: "Nezáleží" },
              ...TRANSPORT_MODES.map((m) => ({ value: m.value, label: m.label })),
            ]}
            error={fieldError(errors, "transportMode")}
          />
        </div>
      </div>

      <StepFooter
        onBack={
          onBack
            ? () => {
                const candidate = buildCandidate();
                if (Number.isNaN(candidate.maximumCommuteMinutes)) {
                  candidate.maximumCommuteMinutes = undefined;
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
