"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteListingSourceAction, upsertListingSourceAction } from "@/actions/listing-source";
import type { ListingSourceInput } from "@/lib/validations/listing-source";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Modal,
  Select,
} from "@/components/ui";

export interface SourceRow {
  id: string;
  name: string;
  domain: string;
  logoUrl: string | null;
  integrationType: "MANUAL_LINK" | "METADATA_IMPORT" | "FEED" | "API";
  isActive: boolean;
  allowPreviewImages: boolean;
  allowMetadataImport: boolean;
  listingCount: number;
}

const INTEGRATION_OPTIONS = [
  { value: "MANUAL_LINK", label: "Ruční odkaz" },
  { value: "METADATA_IMPORT", label: "Import metadat" },
  { value: "FEED", label: "Feed" },
  { value: "API", label: "API" },
];

const EMPTY_FORM: ListingSourceInput = {
  name: "",
  domain: "",
  logoUrl: "",
  integrationType: "MANUAL_LINK",
  isActive: true,
  allowPreviewImages: false,
  allowMetadataImport: true,
};

export function SourceManager({ sources }: { sources: SourceRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<ListingSourceInput | null>(null);

  const submit = () => {
    if (!editing) return;
    setError(null);
    startTransition(async () => {
      const result = await upsertListingSourceAction(editing);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setEditing(null);
      router.refresh();
    });
  };

  const remove = (sourceId: string) => {
    setError(null);
    startTransition(async () => {
      const result = await deleteListingSourceAction(sourceId);
      if (!result.success) setError(result.error);
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button onClick={() => setEditing({ ...EMPTY_FORM })}>+ Přidat zdroj</Button>
      </div>
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-col gap-3">
        {sources.map((source) => (
          <Card key={source.id}>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {source.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-entered external logo
                  <img
                    src={source.logoUrl}
                    alt={source.name}
                    className="size-9 rounded object-contain"
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {source.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{source.name}</p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {source.domain} · {source.listingCount} nabídek
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={source.isActive ? "success" : "danger"}>
                  {source.isActive ? "Aktivní" : "Neaktivní"}
                </Badge>
                <Badge variant="outline">
                  {INTEGRATION_OPTIONS.find((o) => o.value === source.integrationType)?.label}
                </Badge>
                <Badge variant={source.allowPreviewImages ? "info" : "default"}>
                  {source.allowPreviewImages ? "Náhledy ✓" : "Náhledy ✗"}
                </Badge>
                <Badge variant={source.allowMetadataImport ? "info" : "default"}>
                  {source.allowMetadataImport ? "Metadata ✓" : "Metadata ✗"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isPending}
                  onClick={() =>
                    setEditing({
                      id: source.id,
                      name: source.name,
                      domain: source.domain,
                      logoUrl: source.logoUrl ?? "",
                      integrationType: source.integrationType,
                      isActive: source.isActive,
                      allowPreviewImages: source.allowPreviewImages,
                      allowMetadataImport: source.allowMetadataImport,
                    })
                  }
                >
                  Upravit
                </Button>
                {source.listingCount === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => remove(source.id)}
                    className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Smazat
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? "Upravit zdroj" : "Nový zdroj"}
        footer={
          <>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Zrušit
            </Button>
            <Button onClick={submit} isLoading={isPending}>
              Uložit
            </Button>
          </>
        }
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <Input
              label="Název"
              value={editing.name}
              onChange={(e) => setEditing({ ...editing, name: e.target.value })}
            />
            <Input
              label="Doména"
              placeholder="sreality.cz"
              value={editing.domain}
              onChange={(e) => setEditing({ ...editing, domain: e.target.value })}
            />
            <Input
              label="Logo (URL)"
              placeholder="https://…"
              value={editing.logoUrl ?? ""}
              onChange={(e) => setEditing({ ...editing, logoUrl: e.target.value })}
            />
            <Select
              label="Typ integrace"
              value={editing.integrationType}
              onChange={(e) =>
                setEditing({
                  ...editing,
                  integrationType: e.target.value as ListingSourceInput["integrationType"],
                })
              }
              options={INTEGRATION_OPTIONS}
            />
            <Checkbox
              label="Aktivní zdroj"
              checked={editing.isActive}
              onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })}
            />
            <Checkbox
              label="Povolit náhledové obrázky"
              description="Náhledy z tohoto zdroje se smí zobrazovat u nabídek."
              checked={editing.allowPreviewImages}
              onChange={(e) => setEditing({ ...editing, allowPreviewImages: e.target.checked })}
            />
            <Checkbox
              label="Povolit import metadat"
              description="Při vložení URL se načte titulek a základní údaje."
              checked={editing.allowMetadataImport}
              onChange={(e) => setEditing({ ...editing, allowMetadataImport: e.target.checked })}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
