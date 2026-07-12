import { z } from "zod";

const PURPOSES = [
  "OWN_LIVING",
  "FAMILY_LIVING",
  "INVESTMENT_LONG_TERM_RENT",
  "INVESTMENT_SHORT_TERM_RENT",
  "RECREATION",
  "RENOVATION_PROJECT",
  "RESALE",
  "FOR_RELATIVES",
] as const;

const PROPERTY_TYPES = [
  "APARTMENT",
  "FAMILY_HOUSE",
  "TOWNHOUSE",
  "VILLA",
  "COTTAGE",
  "RECREATIONAL_PROPERTY",
  "BUILDING_PLOT",
  "COOPERATIVE_APARTMENT",
  "ATELIER",
  "NON_RESIDENTIAL_UNIT",
  "NEW_BUILD",
  "PRE_RENOVATION",
] as const;

const DISPOSITION_VALUES = [
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

const TRANSPORT_MODES = ["CAR", "PUBLIC_TRANSPORT", "BICYCLE", "WALKING"] as const;

const PRIORITY_LEVEL_VALUES = [
  "MUST_HAVE",
  "VERY_IMPORTANT",
  "IMPORTANT",
  "NICE_TO_HAVE",
  "IRRELEVANT",
] as const;

/** Amount in CZK — optional, non-negative. */
const czk = z
  .number("Zadejte platné číslo")
  .min(0, "Hodnota nesmí být záporná")
  .max(999_999_999, "Hodnota je příliš vysoká")
  .optional();

// ---------------------------------------------------------------------------
// Wizard steps
// ---------------------------------------------------------------------------

export const stepPurposeSchema = z.object({
  name: z.string().min(2, "Zadejte název profilu (alespoň 2 znaky)").max(100),
  purpose: z.enum(PURPOSES, "Vyberte účel hledání"),
});

export const stepBudgetSchema = z
  .object({
    idealPrice: czk,
    maximumPrice: z
      .number("Zadejte maximální cenu")
      .min(1, "Zadejte maximální cenu")
      .max(999_999_999, "Hodnota je příliš vysoká"),
    ownSavings: czk,
    plannedMortgage: czk,
    netMonthlyIncome: czk,
    existingMonthlyPayments: czk,
    maximumMonthlyPayment: czk,
    financialReserve: czk,
    renovationBudget: czk,
    furnishingBudget: czk,
  })
  .refine((d) => d.idealPrice === undefined || d.idealPrice <= d.maximumPrice, {
    message: "Ideální cena nesmí být vyšší než maximální",
    path: ["idealPrice"],
  });

export const stepPropertyTypesSchema = z.object({
  propertyTypes: z.array(z.enum(PROPERTY_TYPES)).min(1, "Vyberte alespoň jeden typ nemovitosti"),
});

export const stepLocationSchema = z
  .object({
    preferredRegions: z.array(z.string().min(1).max(100)).max(14),
    preferredCities: z.array(z.string().min(1).max(100)).max(30),
    preferredCityParts: z.array(z.string().min(1).max(100)).max(30),
    excludedLocations: z.array(z.string().min(1).max(100)).max(30),
    commuteDestination: z.string().max(200).optional().or(z.literal("")),
    maximumCommuteMinutes: z
      .number("Zadejte platné číslo")
      .int("Zadejte celé číslo")
      .min(1, "Minimálně 1 minuta")
      .max(240, "Maximálně 240 minut")
      .optional(),
    transportMode: z.enum(TRANSPORT_MODES).optional().or(z.literal("")),
  })
  .refine((d) => d.preferredRegions.length > 0 || d.preferredCities.length > 0, {
    message: "Vyberte alespoň jeden kraj nebo zadejte město",
    path: ["preferredRegions"],
  });

export const stepSizeSchema = z
  .object({
    minimumArea: z
      .number("Zadejte platné číslo")
      .min(1, "Minimálně 1 m²")
      .max(10_000, "Hodnota je příliš vysoká")
      .optional(),
    maximumArea: z
      .number("Zadejte platné číslo")
      .min(1, "Minimálně 1 m²")
      .max(10_000, "Hodnota je příliš vysoká")
      .optional(),
    dispositions: z.array(z.enum(DISPOSITION_VALUES)),
    minimumRooms: z
      .number("Zadejte platné číslo")
      .int("Zadejte celé číslo")
      .min(1)
      .max(20)
      .optional(),
    maximumRooms: z
      .number("Zadejte platné číslo")
      .int("Zadejte celé číslo")
      .min(1)
      .max(20)
      .optional(),
  })
  .refine((d) => !d.minimumArea || !d.maximumArea || d.minimumArea <= d.maximumArea, {
    message: "Minimální výměra nesmí být větší než maximální",
    path: ["minimumArea"],
  })
  .refine((d) => !d.minimumRooms || !d.maximumRooms || d.minimumRooms <= d.maximumRooms, {
    message: "Minimální počet pokojů nesmí být větší než maximální",
    path: ["minimumRooms"],
  });

export const stepFeaturesSchema = z.object({
  ownership: z.enum(["ANY", "PERSONAL", "COOPERATIVE"]),
  condition: z.enum(["ANY", "NEW_BUILD", "EXCELLENT", "GOOD", "NEEDS_RENOVATION"]),
  floor: z.enum(["ANY", "NOT_GROUND", "LOW", "HIGH"]),
  energyClass: z.enum(["ANY", "A", "B", "C", "D", "E"]),
  features: z.array(z.string().max(50)).max(30),
});

export const stepLifestyleSchema = z.object({
  lifestyle: z.array(z.string().max(50)).max(30),
});

export const stepPrioritiesSchema = z.object({
  priorities: z.record(z.string().max(50), z.enum(PRIORITY_LEVEL_VALUES)),
});

// ---------------------------------------------------------------------------
// Whole wizard
// ---------------------------------------------------------------------------

const wizardObjectSchema = z.object({
  ...stepPurposeSchema.shape,
  ...stepBudgetSchema.shape,
  ...stepPropertyTypesSchema.shape,
  ...stepLocationSchema.shape,
  ...stepSizeSchema.shape,
  ...stepFeaturesSchema.shape,
  ...stepLifestyleSchema.shape,
  ...stepPrioritiesSchema.shape,
});

export const searchProfileWizardSchema = wizardObjectSchema
  .refine((d) => d.idealPrice === undefined || d.idealPrice <= d.maximumPrice, {
    message: "Ideální cena nesmí být vyšší než maximální",
    path: ["idealPrice"],
  })
  .refine((d) => d.preferredRegions.length > 0 || d.preferredCities.length > 0, {
    message: "Vyberte alespoň jeden kraj nebo zadejte město",
    path: ["preferredRegions"],
  })
  .refine((d) => !d.minimumArea || !d.maximumArea || d.minimumArea <= d.maximumArea, {
    message: "Minimální výměra nesmí být větší než maximální",
    path: ["minimumArea"],
  })
  .refine((d) => !d.minimumRooms || !d.maximumRooms || d.minimumRooms <= d.maximumRooms, {
    message: "Minimální počet pokojů nesmí být větší než maximální",
    path: ["minimumRooms"],
  });

export type StepPurposeInput = z.infer<typeof stepPurposeSchema>;
export type StepBudgetInput = z.infer<typeof stepBudgetSchema>;
export type StepPropertyTypesInput = z.infer<typeof stepPropertyTypesSchema>;
export type StepLocationInput = z.infer<typeof stepLocationSchema>;
export type StepSizeInput = z.infer<typeof stepSizeSchema>;
export type StepFeaturesInput = z.infer<typeof stepFeaturesSchema>;
export type StepLifestyleInput = z.infer<typeof stepLifestyleSchema>;
export type StepPrioritiesInput = z.infer<typeof stepPrioritiesSchema>;
export type SearchProfileWizardData = z.infer<typeof searchProfileWizardSchema>;

/** Loose schema for persisted drafts — never blocks saving partial data. */
export const wizardDraftSchema = wizardObjectSchema.partial();
export type WizardDraftData = z.infer<typeof wizardDraftSchema>;

export const EMPTY_WIZARD_DATA: WizardDraftData = {
  name: "",
  purpose: undefined,
  propertyTypes: [],
  preferredRegions: [],
  preferredCities: [],
  preferredCityParts: [],
  excludedLocations: [],
  dispositions: [],
  ownership: "ANY",
  condition: "ANY",
  floor: "ANY",
  energyClass: "ANY",
  features: [],
  lifestyle: [],
  priorities: {},
};
