"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createListingAction, updateListingAction } from "@/actions/listing";
import { DISPOSITIONS } from "@/lib/search-criteria";
import {
  CONSTRUCTION_TYPES,
  ENERGY_CLASSES,
  LISTING_STATUSES,
  OWNERSHIP_TYPES,
  PROPERTY_CONDITIONS,
  PROPERTY_TYPES,
  SELLER_TYPES,
} from "@/lib/property-labels";
import { listingFormSchema, type ListingFormInput } from "@/lib/validations/listing";
import { Alert, Button, Checkbox, Input, Select, Textarea } from "@/components/ui";

/** Parse a user-typed number ("6 500 000", "65,5") for RHF setValueAs. */
const asNumber = (value: unknown) => {
  if (value === "" || value == null) return undefined;
  if (typeof value === "number") return Number.isNaN(value) ? undefined : value;
  return Number(String(value).replace(/\s/g, "").replace(",", "."));
};

const FEATURE_CHECKBOXES: { key: keyof ListingFormInput; label: string }[] = [
  { key: "hasElevator", label: "Výtah" },
  { key: "hasBalcony", label: "Balkon" },
  { key: "hasLoggia", label: "Lodžie" },
  { key: "hasTerrace", label: "Terasa" },
  { key: "hasGarden", label: "Zahrada" },
  { key: "hasCellar", label: "Sklep" },
  { key: "hasGarage", label: "Garáž" },
  { key: "hasParking", label: "Parkovací stání" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="rounded-xl border border-zinc-200 p-4 sm:p-5 dark:border-zinc-800">
      <legend className="px-1.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

export interface ListingFormProps {
  mode: "create" | "edit";
  listingId?: string;
  sources: { id: string; name: string }[];
  regions: string[];
  defaultValues: Partial<ListingFormInput>;
  prefillNotice?: string;
}

export function ListingForm({
  mode,
  listingId,
  sources,
  regions,
  defaultValues,
  prefillNotice,
}: ListingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      sourceUrl: "",
      sourceId: sources[0]?.id ?? "",
      title: "",
      propertyType: undefined,
      disposition: "UNKNOWN",
      ownershipType: "UNKNOWN",
      condition: "UNKNOWN",
      energyClass: "UNKNOWN",
      constructionType: "UNKNOWN",
      sellerType: "UNKNOWN",
      listingStatus: "ACTIVE",
      hasElevator: false,
      hasBalcony: false,
      hasLoggia: false,
      hasTerrace: false,
      hasGarden: false,
      hasCellar: false,
      hasGarage: false,
      hasParking: false,
      commissionIncluded: false,
      ...defaultValues,
    },
  });

  const price = watch("price");
  const area = watch("area");
  const pricePerSqm =
    typeof price === "number" && typeof area === "number" && price > 0 && area > 0
      ? Math.round(price / area)
      : null;

  const onSubmit = async (data: ListingFormInput) => {
    setServerError(null);
    const result =
      mode === "create"
        ? await createListingAction(data)
        : await updateListingAction(listingId!, data);

    if (result.success) {
      router.push(`/properties/${result.listingId}`);
      router.refresh();
    } else {
      setServerError(result.error);
      window.scrollTo({ top: 0 });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {prefillNotice && <Alert variant="info">{prefillNotice}</Alert>}
      {serverError && <Alert variant="error">{serverError}</Alert>}

      <Section title="Zdroj nabídky">
        <div className="flex flex-col gap-4">
          <Input
            label="URL původního inzerátu *"
            placeholder="https://www.sreality.cz/detail/…"
            hint="Nabídka vždy odkazuje na původní zdroj — inzerát nekopírujeme."
            error={errors.sourceUrl?.message}
            {...register("sourceUrl")}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Zdroj *"
              options={sources.map((s) => ({ value: s.id, label: s.name }))}
              error={errors.sourceId?.message}
              {...register("sourceId")}
            />
            <Input
              label="Náhledový obrázek (URL)"
              placeholder="https://…"
              hint="Vyplňte jen, pokud máte právo obrázek použít."
              error={errors.previewImageUrl?.message}
              {...register("previewImageUrl")}
            />
          </div>
          <Input
            label="Název ponuky *"
            placeholder="např. Prodej bytu 3+kk 78 m², Brno"
            error={errors.title?.message}
            {...register("title")}
          />
          <input type="hidden" {...register("externalId")} />
        </div>
      </Section>

      <Section title="Základní parametry">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Typ nemovitosti *"
            placeholder="Vyberte typ"
            defaultValue=""
            options={PROPERTY_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            error={errors.propertyType?.message}
            {...register("propertyType")}
          />
          <Select
            label="Dispozice"
            options={[
              { value: "UNKNOWN", label: "Neuvedeno" },
              ...DISPOSITIONS.map((d) => ({ value: d.value, label: d.label })),
            ]}
            error={errors.disposition?.message}
            {...register("disposition")}
          />
          <Input
            label="Výměra (m²)"
            inputMode="decimal"
            placeholder="např. 78"
            error={errors.area?.message}
            {...register("area", { setValueAs: asNumber })}
          />
          <Input
            label="Cena (Kč)"
            inputMode="numeric"
            placeholder="např. 6 190 000"
            hint={pricePerSqm ? `Cena za m²: ${pricePerSqm.toLocaleString("cs-CZ")} Kč` : undefined}
            error={errors.price?.message}
            {...register("price", { setValueAs: asNumber })}
          />
          <Input
            label="Měsíční náklady (Kč)"
            inputMode="numeric"
            placeholder="např. 4 500"
            hint="Fond oprav, energie, služby…"
            error={errors.monthlyCosts?.message}
            {...register("monthlyCosts", { setValueAs: asNumber })}
          />
          {mode === "edit" && (
            <Select
              label="Stav nabídky"
              options={LISTING_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
              error={errors.listingStatus?.message}
              {...register("listingStatus")}
            />
          )}
        </div>
      </Section>

      <Section title="Lokalita">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Kraj"
            options={[
              { value: "", label: "Neuvedeno" },
              ...regions.map((r) => ({ value: r, label: r })),
            ]}
            error={errors.region?.message}
            {...register("region")}
          />
          <Input
            label="Okres"
            placeholder="např. Brno-město"
            error={errors.district?.message}
            {...register("district")}
          />
          <Input
            label="Město"
            placeholder="např. Brno"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            label="Městská část"
            placeholder="např. Královo Pole"
            error={errors.cityPart?.message}
            {...register("cityPart")}
          />
          <div className="sm:col-span-2">
            <Input
              label="Přibližná adresa"
              placeholder="např. ulice Purkyňova, Brno"
              hint="Stačí ulice nebo oblast — přesnou adresu inzeráty většinou neuvádějí."
              error={errors.approximateAddress?.message}
              {...register("approximateAddress")}
            />
          </div>
        </div>
      </Section>

      <Section title="Vlastnosti nemovitosti">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Vlastnictví"
            options={OWNERSHIP_TYPES.map((o) => ({ value: o.value, label: o.label }))}
            error={errors.ownershipType?.message}
            {...register("ownershipType")}
          />
          <Select
            label="Stav nemovitosti"
            options={PROPERTY_CONDITIONS.map((c) => ({ value: c.value, label: c.label }))}
            error={errors.condition?.message}
            {...register("condition")}
          />
          <Input
            label="Podlaží"
            inputMode="numeric"
            placeholder="např. 4"
            error={errors.floor?.message}
            {...register("floor", { setValueAs: asNumber })}
          />
          <Input
            label="Počet podlaží budovy"
            inputMode="numeric"
            placeholder="např. 8"
            error={errors.totalFloors?.message}
            {...register("totalFloors", { setValueAs: asNumber })}
          />
          <Select
            label="Energetická třída"
            options={ENERGY_CLASSES.map((e) => ({ value: e.value, label: e.label }))}
            error={errors.energyClass?.message}
            {...register("energyClass")}
          />
          <Select
            label="Konstrukce"
            options={CONSTRUCTION_TYPES.map((c) => ({ value: c.value, label: c.label }))}
            error={errors.constructionType?.message}
            {...register("constructionType")}
          />
          <Input
            label="Rok výstavby"
            inputMode="numeric"
            placeholder="např. 1978"
            error={errors.yearBuilt?.message}
            {...register("yearBuilt", { setValueAs: asNumber })}
          />
          <Input
            label="Rok rekonstrukce"
            inputMode="numeric"
            placeholder="např. 2019"
            error={errors.yearRenovated?.message}
            {...register("yearRenovated", { setValueAs: asNumber })}
          />
        </div>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURE_CHECKBOXES.map((feature) => (
            <Checkbox
              key={feature.key}
              label={feature.label}
              {...register(feature.key as "hasElevator")}
            />
          ))}
        </div>
      </Section>

      <Section title="Prodejce">
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Typ prodejce"
            options={SELLER_TYPES.map((s) => ({ value: s.value, label: s.label }))}
            error={errors.sellerType?.message}
            {...register("sellerType")}
          />
          <Input
            label="Realitní kancelář"
            placeholder="např. Demo Reality s.r.o."
            error={errors.agencyName?.message}
            {...register("agencyName")}
          />
          <div className="sm:col-span-2">
            <Checkbox label="Provize je zahrnuta v ceně" {...register("commissionIncluded")} />
          </div>
        </div>
      </Section>

      <Section title="Vaše poznámky">
        <Textarea
          label="Poznámky"
          placeholder="Vlastní postřehy k nabídce — vidí je jen váš účet."
          error={errors.userNote?.message}
          {...register("userNote")}
        />
      </Section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Zrušit
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {mode === "create" ? "Přidat nabídku" : "Uložit změny"}
        </Button>
      </div>
    </form>
  );
}
