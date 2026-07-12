"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import {
  completeOnboardingAction,
  saveOnboardingDraftAction,
  updateSearchProfileAction,
} from "@/actions/search-profile";
import type { WizardDraftData } from "@/lib/validations/search-profile";
import { Alert, Card, CardContent, Progress } from "@/components/ui";
import { StepPurpose } from "./steps/step-purpose";
import { StepBudget } from "./steps/step-budget";
import { StepPropertyTypes } from "./steps/step-property-types";
import { StepLocation } from "./steps/step-location";
import { StepSize } from "./steps/step-size";
import { StepFeatures } from "./steps/step-features";
import { StepLifestyle } from "./steps/step-lifestyle";
import { StepPriorities } from "./steps/step-priorities";

export interface WizardStepProps {
  data: WizardDraftData;
  onNext: (patch: Partial<WizardDraftData>) => void;
  onBack?: (patch: Partial<WizardDraftData>) => void;
  isSubmitting: boolean;
  isLast: boolean;
  regions: string[];
}

const STEPS: {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<WizardStepProps>;
}[] = [
  {
    id: "purpose",
    title: "Účel hledání",
    description: "K čemu má nemovitost sloužit? Podle účelu upravíme hodnocení nabídek.",
    component: StepPurpose,
  },
  {
    id: "budget",
    title: "Rozpočet",
    description:
      "Kolik můžete a chcete investovat? Všechny částky jsou v Kč a slouží jen pro výpočet dostupnosti.",
    component: StepBudget,
  },
  {
    id: "property-types",
    title: "Typ nemovitosti",
    description: "Jaké typy nemovitostí připadají v úvahu? Můžete vybrat více možností.",
    component: StepPropertyTypes,
  },
  {
    id: "location",
    title: "Lokalita",
    description: "Kde hledáte? Uveďte preferovaná i vyloučená místa a dojíždění.",
    component: StepLocation,
  },
  {
    id: "size",
    title: "Velikost a dispozice",
    description: "Jak velkou nemovitost potřebujete?",
    component: StepSize,
  },
  {
    id: "features",
    title: "Vlastnosti",
    description: "Co by nemovitost měla mít? Důležitost upřesníte v posledním kroku.",
    component: StepFeatures,
  },
  {
    id: "lifestyle",
    title: "Životní styl",
    description: "Co je pro vás důležité v okolí?",
    component: StepLifestyle,
  },
  {
    id: "priorities",
    title: "Priority",
    description:
      "U každého kritéria určete, jak moc je důležité. Nezbytná kritéria vyřadí nabídky, které je nesplňují.",
    component: StepPriorities,
  },
];

export interface SearchProfileWizardProps {
  mode: "create" | "edit";
  profileId?: string;
  initialData: WizardDraftData;
  initialStep?: number;
  regions: string[];
}

export function SearchProfileWizard({
  mode,
  profileId,
  initialData,
  initialStep = 0,
  regions,
}: SearchProfileWizardProps) {
  const router = useRouter();
  const [data, setData] = useState<WizardDraftData>(initialData);
  const [stepIndex, setStepIndex] = useState(Math.max(0, Math.min(STEPS.length - 1, initialStep)));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  const persistDraft = useCallback(
    (nextData: WizardDraftData, nextStep: number) => {
      if (mode !== "create") return;
      // Fire-and-forget autosave — the wizard must stay responsive.
      void saveOnboardingDraftAction(nextData, nextStep).catch(() => undefined);
    },
    [mode]
  );

  const handleNext = async (patch: Partial<WizardDraftData>) => {
    const nextData = { ...data, ...patch };
    setData(nextData);
    setServerError(null);

    if (!isLast) {
      const nextStep = stepIndex + 1;
      setStepIndex(nextStep);
      persistDraft(nextData, nextStep);
      window.scrollTo({ top: 0 });
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === "create"
          ? await completeOnboardingAction(nextData)
          : await updateSearchProfileAction(profileId!, nextData);

      if (result.success) {
        const target = result.profileId ? `/search-profiles/${result.profileId}` : "/dashboard";
        router.push(result.info ? `${target}?info=${encodeURIComponent(result.info)}` : target);
        router.refresh();
      } else {
        setServerError(result.error);
        setIsSubmitting(false);
      }
    } catch {
      setServerError("Uložení se nezdařilo. Zkuste to prosím znovu.");
      setIsSubmitting(false);
    }
  };

  const handleBack = (patch: Partial<WizardDraftData>) => {
    if (stepIndex === 0) return;
    const nextData = { ...data, ...patch };
    const nextStep = stepIndex - 1;
    setData(nextData);
    setStepIndex(nextStep);
    setServerError(null);
    persistDraft(nextData, nextStep);
    window.scrollTo({ top: 0 });
  };

  const StepComponent = step.component;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <p className="mb-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          Krok {stepIndex + 1} z {STEPS.length}
        </p>
        <Progress value={((stepIndex + 1) / STEPS.length) * 100} />
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
            {step.title}
          </h1>
          <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">{step.description}</p>

          {serverError && (
            <Alert variant="error" className="mt-4">
              {serverError}
            </Alert>
          )}

          <div className="mt-6">
            <StepComponent
              key={step.id}
              data={data}
              onNext={handleNext}
              onBack={stepIndex > 0 ? handleBack : undefined}
              isSubmitting={isSubmitting}
              isLast={isLast}
              regions={regions}
            />
          </div>
        </CardContent>
      </Card>

      {mode === "create" && (
        <p className="mt-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Rozpracovaný profil se průběžně ukládá — můžete se kdykoli vrátit a pokračovat.
        </p>
      )}
    </div>
  );
}
