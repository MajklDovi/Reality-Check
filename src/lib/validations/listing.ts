import { z } from "zod";

const PROPERTY_TYPE_VALUES = [
  "APARTMENT",
  "HOUSE",
  "LAND",
  "COMMERCIAL",
  "GARAGE",
  "OTHER",
] as const;

const DISPOSITION_VALUES = [
  "UNKNOWN",
  "D_1_KK",
  "D_1_1",
  "D_2_KK",
  "D_2_1",
  "D_3_KK",
  "D_3_1",
  "D_4_KK",
  "D_4_1",
  "D_5_KK",
  "D_5_1",
  "D_6_AND_MORE",
  "ATYPICAL",
] as const;

const OWNERSHIP_VALUES = ["UNKNOWN", "PERSONAL", "COOPERATIVE", "MUNICIPAL", "OTHER"] as const;

const CONDITION_VALUES = [
  "UNKNOWN",
  "NEW_BUILD",
  "EXCELLENT",
  "GOOD",
  "NEEDS_RENOVATION",
  "UNDER_CONSTRUCTION",
  "DEMOLITION",
] as const;

const ENERGY_VALUES = ["UNKNOWN", "A", "B", "C", "D", "E", "F", "G"] as const;

const CONSTRUCTION_VALUES = [
  "UNKNOWN",
  "BRICK",
  "PANEL",
  "WOOD",
  "SKELETON",
  "MIXED",
  "OTHER",
] as const;

const SELLER_VALUES = ["UNKNOWN", "AGENCY", "PRIVATE", "DEVELOPER"] as const;

const LISTING_STATUS_VALUES = ["ACTIVE", "INACTIVE", "UNKNOWN", "REMOVED"] as const;

/** URL of an external listing — http(s) only. */
export const listingUrlSchema = z
  .string()
  .min(1, "Zadejte URL inzerátu")
  .max(2000, "URL je příliš dlouhá")
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Zadejte platnou URL adresu (http/https)");

const optionalMoney = z
  .number("Zadejte platné číslo")
  .min(0, "Hodnota nesmí být záporná")
  .max(999_999_999, "Hodnota je příliš vysoká")
  .optional();

const optionalYear = z
  .number("Zadejte platný rok")
  .int("Zadejte celý rok")
  .min(1800, "Rok je příliš nízký")
  .max(2100, "Rok je příliš vysoký")
  .optional();

export const listingFormSchema = z
  .object({
    sourceUrl: listingUrlSchema,
    sourceId: z.string().min(1, "Vyberte zdroj"),
    title: z.string().min(3, "Zadejte název ponuky (alespoň 3 znaky)").max(200),
    propertyType: z.enum(PROPERTY_TYPE_VALUES, "Vyberte typ nemovitosti"),
    disposition: z.enum(DISPOSITION_VALUES),
    area: z
      .number("Zadejte platné číslo")
      .min(1, "Výměra musí být kladná")
      .max(100_000, "Hodnota je příliš vysoká")
      .optional(),
    price: optionalMoney,
    region: z.string().max(100).optional().or(z.literal("")),
    district: z.string().max(100).optional().or(z.literal("")),
    city: z.string().max(100).optional().or(z.literal("")),
    cityPart: z.string().max(100).optional().or(z.literal("")),
    approximateAddress: z.string().max(200).optional().or(z.literal("")),
    ownershipType: z.enum(OWNERSHIP_VALUES),
    condition: z.enum(CONDITION_VALUES),
    floor: z.number("Zadejte platné číslo").int().min(-5).max(100).optional(),
    totalFloors: z.number("Zadejte platné číslo").int().min(1).max(100).optional(),
    hasElevator: z.boolean(),
    hasBalcony: z.boolean(),
    hasLoggia: z.boolean(),
    hasTerrace: z.boolean(),
    hasGarden: z.boolean(),
    hasCellar: z.boolean(),
    hasGarage: z.boolean(),
    hasParking: z.boolean(),
    energyClass: z.enum(ENERGY_VALUES),
    constructionType: z.enum(CONSTRUCTION_VALUES),
    yearBuilt: optionalYear,
    yearRenovated: optionalYear,
    commissionIncluded: z.boolean(),
    agencyName: z.string().max(150).optional().or(z.literal("")),
    sellerType: z.enum(SELLER_VALUES),
    monthlyCosts: optionalMoney,
    userNote: z.string().max(2000, "Poznámka je příliš dlouhá").optional().or(z.literal("")),
    /** Manually supplied preview image (owner is allowed to attach one). */
    previewImageUrl: z.union([z.url("Zadejte platnou URL obrázku"), z.literal("")]).optional(),
    /** Listing id on the source portal (from URL metadata, hidden field). */
    externalId: z.string().max(100).optional().or(z.literal("")),
    listingStatus: z.enum(LISTING_STATUS_VALUES),
  })
  .refine((d) => !d.floor || !d.totalFloors || d.floor <= d.totalFloors, {
    message: "Podlaží nemůže být vyšší než počet podlaží",
    path: ["floor"],
  });

export type ListingFormInput = z.input<typeof listingFormSchema>;
export type ListingFormData = z.output<typeof listingFormSchema>;

/** Prefill returned by the URL metadata step. */
export interface ListingMetadataPrefill {
  sourceUrl: string;
  sourceId: string;
  sourceName: string;
  title?: string;
  previewImageUrl?: string;
  externalId?: string;
  imageFromAllowedSource: boolean;
  metadataImported: boolean;
  message?: string;
}
