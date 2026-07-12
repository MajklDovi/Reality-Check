"use client";

import { useState } from "react";
import { stepBudgetSchema } from "@/lib/validations/search-profile";
import { Input } from "@/components/ui";
import type { WizardStepProps } from "../wizard";
import { StepFooter, fieldError, numberToInput, parseNumberInput } from "./shared";

const FIELDS: {
  key: keyof BudgetState;
  label: string;
  hint?: string;
  placeholder: string;
}[] = [
  {
    key: "idealPrice",
    label: "Ideální cena (Kč)",
    hint: "Cena, kterou byste rádi zaplatili.",
    placeholder: "např. 6 000 000",
  },
  {
    key: "maximumPrice",
    label: "Maximální cena (Kč) *",
    hint: "Absolutní strop — dražší nabídky vyřadíme.",
    placeholder: "např. 7 500 000",
  },
  {
    key: "ownSavings",
    label: "Vlastní úspory (Kč)",
    hint: "Prostředky na akontaci a poplatky.",
    placeholder: "např. 1 500 000",
  },
  {
    key: "plannedMortgage",
    label: "Plánovaná hypotéka (Kč)",
    placeholder: "např. 5 000 000",
  },
  {
    key: "netMonthlyIncome",
    label: "Čistý měsíční příjem domácnosti (Kč)",
    placeholder: "např. 65 000",
  },
  {
    key: "existingMonthlyPayments",
    label: "Stávající měsíční splátky (Kč)",
    hint: "Součet splátek úvěrů, leasingů apod.",
    placeholder: "např. 4 000",
  },
  {
    key: "maximumMonthlyPayment",
    label: "Maximální přijatelná splátka (Kč)",
    placeholder: "např. 25 000",
  },
  {
    key: "financialReserve",
    label: "Finanční rezerva po koupi (Kč)",
    hint: "Kolik vám má zbýt po zaplacení kupní ceny.",
    placeholder: "např. 200 000",
  },
  {
    key: "renovationBudget",
    label: "Rozpočet na rekonstrukci (Kč)",
    placeholder: "např. 500 000",
  },
  {
    key: "furnishingBudget",
    label: "Rozpočet na zařízení (Kč)",
    placeholder: "např. 150 000",
  },
];

type BudgetState = {
  idealPrice: string;
  maximumPrice: string;
  ownSavings: string;
  plannedMortgage: string;
  netMonthlyIncome: string;
  existingMonthlyPayments: string;
  maximumMonthlyPayment: string;
  financialReserve: string;
  renovationBudget: string;
  furnishingBudget: string;
};

export function StepBudget({ data, onNext, onBack, isSubmitting, isLast }: WizardStepProps) {
  const [values, setValues] = useState<BudgetState>({
    idealPrice: numberToInput(data.idealPrice),
    maximumPrice: numberToInput(data.maximumPrice),
    ownSavings: numberToInput(data.ownSavings),
    plannedMortgage: numberToInput(data.plannedMortgage),
    netMonthlyIncome: numberToInput(data.netMonthlyIncome),
    existingMonthlyPayments: numberToInput(data.existingMonthlyPayments),
    maximumMonthlyPayment: numberToInput(data.maximumMonthlyPayment),
    financialReserve: numberToInput(data.financialReserve),
    renovationBudget: numberToInput(data.renovationBudget),
    furnishingBudget: numberToInput(data.furnishingBudget),
  });
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>();

  const toNumbers = () => ({
    idealPrice: parseNumberInput(values.idealPrice),
    maximumPrice: parseNumberInput(values.maximumPrice),
    ownSavings: parseNumberInput(values.ownSavings),
    plannedMortgage: parseNumberInput(values.plannedMortgage),
    netMonthlyIncome: parseNumberInput(values.netMonthlyIncome),
    existingMonthlyPayments: parseNumberInput(values.existingMonthlyPayments),
    maximumMonthlyPayment: parseNumberInput(values.maximumMonthlyPayment),
    financialReserve: parseNumberInput(values.financialReserve),
    renovationBudget: parseNumberInput(values.renovationBudget),
    furnishingBudget: parseNumberInput(values.furnishingBudget),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = stepBudgetSchema.safeParse(toNumbers());
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setErrors(undefined);
    onNext(parsed.data);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            inputMode="numeric"
            placeholder={field.placeholder}
            hint={field.hint}
            error={fieldError(errors, field.key)}
            value={values[field.key]}
            onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
          />
        ))}
      </div>
      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Povinná je pouze maximální cena (*). Čím více údajů vyplníte, tím přesnější bude hodnocení
        finanční dostupnosti.
      </p>

      <StepFooter
        onBack={onBack ? () => onBack(sanitizeForBack(toNumbers())) : undefined}
        isSubmitting={isSubmitting}
        isLast={isLast}
      />
    </form>
  );
}

/** Drop NaN values (unparseable input) when navigating back without validation. */
function sanitizeForBack<T extends Record<string, number | undefined>>(values: T): T {
  const result = { ...values };
  for (const key of Object.keys(result) as (keyof T)[]) {
    const value = result[key];
    if (typeof value === "number" && Number.isNaN(value)) {
      result[key] = undefined as T[keyof T];
    }
  }
  return result;
}
