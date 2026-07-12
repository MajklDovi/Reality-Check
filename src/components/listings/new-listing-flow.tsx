"use client";

import { useState } from "react";
import { fetchListingMetadataAction } from "@/actions/listing";
import type { ListingFormInput, ListingMetadataPrefill } from "@/lib/validations/listing";
import { Alert, Button, Card, CardContent, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { ListingForm } from "./listing-form";

export interface NewListingFlowProps {
  sources: { id: string; name: string }[];
  regions: string[];
}

type Mode = "url" | "manual";

export function NewListingFlow({ sources, regions }: NewListingFlowProps) {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prefill, setPrefill] = useState<ListingMetadataPrefill | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsFetching(true);
    try {
      const result = await fetchListingMetadataAction(url.trim());
      if (result.success) {
        setPrefill(result.prefill);
      } else {
        setError(result.error);
      }
    } finally {
      setIsFetching(false);
    }
  };

  // After the URL step (or in manual mode) show the full form for review.
  if (prefill || mode === "manual") {
    const defaults: Partial<ListingFormInput> = prefill
      ? {
          sourceUrl: prefill.sourceUrl,
          sourceId: prefill.sourceId,
          title: prefill.title ?? "",
          previewImageUrl: prefill.previewImageUrl ?? "",
          externalId: prefill.externalId ?? "",
        }
      : {};

    const notice = prefill
      ? (prefill.message ??
        `Zdroj: ${prefill.sourceName}. Zkontrolujte načtené údaje a doplňte zbytek — přesnější data znamenají lepší analýzu.`)
      : undefined;

    return (
      <div className="flex flex-col gap-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            setPrefill(null);
            setMode("url");
          }}
        >
          ← Zpět na výběr způsobu přidání
        </Button>
        <ListingForm
          mode="create"
          sources={sources}
          regions={regions}
          defaultValues={defaults}
          prefillNotice={notice}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div className="grid grid-cols-2 gap-2" role="tablist" aria-label="Způsob přidání">
        {(
          [
            { id: "url", label: "Vložit URL" },
            { id: "manual", label: "Vyplnit ručně" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={mode === tab.id}
            onClick={() => setMode(tab.id)}
            className={cn(
              "rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
              mode === tab.id
                ? "border-indigo-600 bg-indigo-50 text-indigo-900 dark:border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-200"
                : "border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800/50"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleFetch} className="flex flex-col gap-4" noValidate>
            {error && <Alert variant="error">{error}</Alert>}
            <Input
              label="URL inzerátu"
              type="url"
              placeholder="https://www.sreality.cz/detail/…"
              hint="Vložte odkaz na inzerát z realitního portálu. Načteme jen základní povolená metadata (titulek, náhled) — zbytek doplníte a zkontrolujete v dalším kroku."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button type="submit" isLoading={isFetching}>
              Načíst nabídku
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
