"use client";

import { Button } from "@/components/ui";

/** Parse a user-typed amount ("6 500 000", "65,5") into a number or undefined. */
export function parseNumberInput(raw: string): number | undefined {
  const cleaned = raw.replace(/\s/g, "").replace(",", ".");
  if (cleaned === "") return undefined;
  const value = Number(cleaned);
  return Number.isNaN(value) ? NaN : value;
}

/** Initial string value for a numeric field. */
export function numberToInput(value: number | undefined | null): string {
  return value == null ? "" : String(value);
}

/** First error message for a field from a zod flatten() result. */
export function fieldError(
  errors: Record<string, string[] | undefined> | undefined,
  field: string
): string | undefined {
  return errors?.[field]?.[0];
}

export interface StepFooterProps {
  onBack?: () => void;
  isSubmitting?: boolean;
  isLast?: boolean;
}

export function StepFooter({ onBack, isSubmitting = false, isLast = false }: StepFooterProps) {
  return (
    <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      {onBack ? (
        <Button type="button" variant="outline" onClick={onBack} disabled={isSubmitting}>
          Zpět
        </Button>
      ) : (
        <span />
      )}
      <Button type="submit" isLoading={isSubmitting}>
        {isLast ? "Dokončit profil" : "Pokračovat"}
      </Button>
    </div>
  );
}
