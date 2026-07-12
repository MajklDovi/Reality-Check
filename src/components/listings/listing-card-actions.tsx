"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toggleComparisonAction, toggleSavedPropertyAction } from "@/actions/listing";
import { Button } from "@/components/ui";

export interface ListingCardActionsProps {
  propertyId: string;
  initialSaved: boolean;
  initialInComparison: boolean;
}

export function ListingCardActions({
  propertyId,
  initialSaved,
  initialInComparison,
}: ListingCardActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(initialSaved);
  const [inComparison, setInComparison] = useState(initialInComparison);

  const handleSave = () => {
    startTransition(async () => {
      const result = await toggleSavedPropertyAction(propertyId);
      if (result.success) {
        setSaved(result.saved);
        router.refresh();
      }
    });
  };

  const handleCompare = () => {
    startTransition(async () => {
      const result = await toggleComparisonAction(propertyId);
      if (result.success) {
        setInComparison(result.inComparison);
        router.refresh();
      }
    });
  };

  return (
    <>
      <Button
        variant={saved ? "secondary" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={handleSave}
        aria-pressed={saved}
      >
        {saved ? "★ Uloženo" : "☆ Uložit"}
      </Button>
      <Button
        variant={inComparison ? "secondary" : "outline"}
        size="sm"
        disabled={isPending}
        onClick={handleCompare}
        aria-pressed={inComparison}
      >
        {inComparison ? "✓ V porovnání" : "⇄ Porovnat"}
      </Button>
    </>
  );
}
