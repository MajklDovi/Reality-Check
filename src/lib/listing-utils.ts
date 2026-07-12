import type { Disposition, OwnershipType, PropertyCondition } from "@/generated/prisma/enums";

/**
 * Input for data-completeness — the 8 key fields of a listing.
 * Values may come from the form (plain) or from DB rows.
 */
export interface CompletenessInput {
  price: number | null | undefined;
  area: number | null | undefined;
  city: string | null | undefined;
  propertyType: string | null | undefined;
  disposition: Disposition | null | undefined;
  ownershipType: OwnershipType | null | undefined;
  condition: PropertyCondition | null | undefined;
  sourceUrl: string | null | undefined;
}

/** Share of filled key fields, 0..1 (price, area, location, type, disposition, ownership, condition, source link). */
export function computeListingCompleteness(input: CompletenessInput): number {
  const checks: boolean[] = [
    input.price != null && input.price > 0,
    input.area != null && input.area > 0,
    !!input.city?.trim(),
    !!input.propertyType,
    input.disposition != null && input.disposition !== "UNKNOWN",
    input.ownershipType != null && input.ownershipType !== "UNKNOWN",
    input.condition != null && input.condition !== "UNKNOWN",
    !!input.sourceUrl?.trim(),
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100) / 100;
}

export interface CompletenessLevel {
  label: string;
  badge: "success" | "warning" | "danger";
}

/** Human-readable completeness level: high >= 0.75, medium >= 0.5, low otherwise. */
export function completenessLevel(value: number): CompletenessLevel {
  if (value >= 0.75) return { label: "Vysoká úplnost", badge: "success" };
  if (value >= 0.5) return { label: "Střední úplnost", badge: "warning" };
  return { label: "Nízká úplnost", badge: "danger" };
}

/** Price per m², rounded to whole CZK; null when either value is missing. */
export function computePricePerSquareMeter(
  price: number | null | undefined,
  area: number | null | undefined
): number | null {
  if (price == null || area == null || price <= 0 || area <= 0) return null;
  return Math.round(price / area);
}

/** Short "Brno — Královo Pole" style location string. */
export function formatLocation(parts: {
  city?: string | null;
  cityPart?: string | null;
  district?: string | null;
  region?: string | null;
}): string {
  if (parts.city && parts.cityPart) return `${parts.city} — ${parts.cityPart}`;
  return parts.city || parts.district || parts.region || "Lokalita neuvedena";
}

/**
 * Whether the stored preview image may be displayed.
 * True only when the listing has an image AND its usage was allowed at save
 * time (allowed source metadata, or manually supplied by the owning user).
 */
export function canShowPreviewImage(listing: {
  previewImageUrl: string | null;
  imageUsageAllowed: boolean;
}): boolean {
  return !!listing.previewImageUrl && listing.imageUsageAllowed;
}
