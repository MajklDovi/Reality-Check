import type {
  DesiredPropertyType,
  Disposition,
  SearchPurpose,
  TransportMode,
} from "@/generated/prisma/enums";

// ---------------------------------------------------------------------------
// Enum labels (Czech UI)
// ---------------------------------------------------------------------------

export const SEARCH_PURPOSES: { value: SearchPurpose; label: string; description: string }[] = [
  {
    value: "OWN_LIVING",
    label: "Vlastní bydlení",
    description: "Hledám nemovitost pro sebe.",
  },
  {
    value: "FAMILY_LIVING",
    label: "Bydlení pro rodinu",
    description: "Hledám domov pro rodinu s ohledem na školy a okolí.",
  },
  {
    value: "INVESTMENT_LONG_TERM_RENT",
    label: "Investice — dlouhodobý pronájem",
    description: "Chci nemovitost dlouhodobě pronajímat.",
  },
  {
    value: "INVESTMENT_SHORT_TERM_RENT",
    label: "Investice — krátkodobý pronájem",
    description: "Plánuji krátkodobé pronájmy (např. Airbnb).",
  },
  {
    value: "RECREATION",
    label: "Rekreační nemovitost",
    description: "Chata, chalupa nebo apartmán pro volný čas.",
  },
  {
    value: "RENOVATION_PROJECT",
    label: "Koupě k rekonstrukci",
    description: "Hledám nemovitost, kterou opravím podle svého.",
  },
  {
    value: "RESALE",
    label: "Koupě k dalšímu prodeji",
    description: "Chci nemovitost zhodnotit a prodat.",
  },
  {
    value: "FOR_RELATIVES",
    label: "Pro rodiče nebo děti",
    description: "Kupuji bydlení pro blízké.",
  },
];

export const DESIRED_PROPERTY_TYPES: { value: DesiredPropertyType; label: string }[] = [
  { value: "APARTMENT", label: "Byt" },
  { value: "FAMILY_HOUSE", label: "Rodinný dům" },
  { value: "TOWNHOUSE", label: "Řadový dům" },
  { value: "VILLA", label: "Vila" },
  { value: "COTTAGE", label: "Chalupa" },
  { value: "RECREATIONAL_PROPERTY", label: "Rekreační objekt" },
  { value: "BUILDING_PLOT", label: "Stavební pozemek" },
  { value: "COOPERATIVE_APARTMENT", label: "Družstevní byt" },
  { value: "ATELIER", label: "Ateliér" },
  { value: "NON_RESIDENTIAL_UNIT", label: "Nebytová jednotka" },
  { value: "NEW_BUILD", label: "Novostavba" },
  { value: "PRE_RENOVATION", label: "Před rekonstrukcí" },
];

export const DISPOSITIONS: { value: Exclude<Disposition, "UNKNOWN">; label: string }[] = [
  { value: "D_1_KK", label: "1+kk" },
  { value: "D_1_1", label: "1+1" },
  { value: "D_2_KK", label: "2+kk" },
  { value: "D_2_1", label: "2+1" },
  { value: "D_3_KK", label: "3+kk" },
  { value: "D_3_1", label: "3+1" },
  { value: "D_4_KK", label: "4+kk" },
  { value: "D_4_1", label: "4+1" },
  { value: "D_5_KK", label: "5+kk" },
  { value: "D_5_1", label: "5+1" },
  { value: "D_6_AND_MORE", label: "6 a více" },
  { value: "ATYPICAL", label: "Atypický" },
];

export const TRANSPORT_MODES: { value: TransportMode; label: string }[] = [
  { value: "CAR", label: "Autem" },
  { value: "PUBLIC_TRANSPORT", label: "Veřejnou dopravou" },
  { value: "BICYCLE", label: "Na kole" },
  { value: "WALKING", label: "Pěšky" },
];

// ---------------------------------------------------------------------------
// Priority levels (step 8)
// ---------------------------------------------------------------------------

export type PriorityLevel =
  "MUST_HAVE" | "VERY_IMPORTANT" | "IMPORTANT" | "NICE_TO_HAVE" | "IRRELEVANT";

export const PRIORITY_LEVELS: { value: PriorityLevel; label: string; weight: number }[] = [
  { value: "MUST_HAVE", label: "Nezbytné", weight: 10 },
  { value: "VERY_IMPORTANT", label: "Velmi důležité", weight: 7 },
  { value: "IMPORTANT", label: "Důležité", weight: 4 },
  { value: "NICE_TO_HAVE", label: "Výhoda navíc", weight: 2 },
  { value: "IRRELEVANT", label: "Nepodstatné", weight: 0 },
];

export const DEFAULT_PRIORITY_LEVEL: PriorityLevel = "IMPORTANT";

export function priorityWeight(level: PriorityLevel): number {
  return PRIORITY_LEVELS.find((l) => l.value === level)?.weight ?? 4;
}

export function levelFromPreference(priority: number, isRequired: boolean): PriorityLevel {
  if (isRequired) return "MUST_HAVE";
  if (priority >= 7) return "VERY_IMPORTANT";
  if (priority >= 4) return "IMPORTANT";
  if (priority >= 1) return "NICE_TO_HAVE";
  return "IRRELEVANT";
}

// ---------------------------------------------------------------------------
// Criteria catalog (steps 6 + 7) — stored as Preference rows (key/value)
// ---------------------------------------------------------------------------

export interface SelectCriterion {
  kind: "select";
  key: string;
  label: string;
  description?: string;
  options: { value: string; label: string }[];
  /** Value meaning "no preference" — not stored. */
  anyValue: string;
}

export interface BooleanCriterion {
  kind: "boolean";
  key: string;
  label: string;
  description?: string;
}

export type Criterion = SelectCriterion | BooleanCriterion;

export const FEATURE_SELECT_CRITERIA: SelectCriterion[] = [
  {
    kind: "select",
    key: "ownership",
    label: "Vlastnictví",
    description: "Družstevní byty bývají levnější, ale hůře se financují hypotékou.",
    anyValue: "ANY",
    options: [
      { value: "ANY", label: "Nezáleží" },
      { value: "PERSONAL", label: "Osobní" },
      { value: "COOPERATIVE", label: "Družstevní" },
    ],
  },
  {
    kind: "select",
    key: "condition",
    label: "Stav nemovitosti",
    anyValue: "ANY",
    options: [
      { value: "ANY", label: "Nezáleží" },
      { value: "NEW_BUILD", label: "Novostavba" },
      { value: "EXCELLENT", label: "Výborný" },
      { value: "GOOD", label: "Dobrý" },
      { value: "NEEDS_RENOVATION", label: "Před rekonstrukcí" },
    ],
  },
  {
    kind: "select",
    key: "floor",
    label: "Podlaží",
    anyValue: "ANY",
    options: [
      { value: "ANY", label: "Nezáleží" },
      { value: "NOT_GROUND", label: "Ne přízemí" },
      { value: "LOW", label: "Nižší patra (1.–3.)" },
      { value: "HIGH", label: "Vyšší patra" },
    ],
  },
  {
    kind: "select",
    key: "energy_class",
    label: "Energetická třída (nejhorší přijatelná)",
    description: "Horší třída znamená vyšší náklady na energie.",
    anyValue: "ANY",
    options: [
      { value: "ANY", label: "Nezáleží" },
      { value: "A", label: "A" },
      { value: "B", label: "B" },
      { value: "C", label: "C" },
      { value: "D", label: "D" },
      { value: "E", label: "E" },
    ],
  },
];

export const FEATURE_FLAG_CRITERIA: BooleanCriterion[] = [
  { kind: "boolean", key: "elevator", label: "Výtah" },
  { kind: "boolean", key: "balcony", label: "Balkon" },
  { kind: "boolean", key: "loggia", label: "Lodžie" },
  { kind: "boolean", key: "terrace", label: "Terasa" },
  { kind: "boolean", key: "garden", label: "Zahrada" },
  { kind: "boolean", key: "cellar", label: "Sklep" },
  { kind: "boolean", key: "garage", label: "Garáž" },
  { kind: "boolean", key: "parking", label: "Parkovací stání" },
  { kind: "boolean", key: "barrier_free", label: "Bezbariérovost" },
  { kind: "boolean", key: "new_building", label: "Novostavba" },
];

export const LIFESTYLE_CRITERIA: BooleanCriterion[] = [
  { kind: "boolean", key: "public_transport", label: "Dostupnost MHD" },
  { kind: "boolean", key: "short_commute", label: "Krátké dojíždění" },
  { kind: "boolean", key: "schools", label: "Školy" },
  { kind: "boolean", key: "kindergartens", label: "Školky" },
  { kind: "boolean", key: "shops", label: "Obchody" },
  { kind: "boolean", key: "doctors", label: "Lékaři" },
  { kind: "boolean", key: "parks", label: "Parky" },
  { kind: "boolean", key: "nature", label: "Příroda" },
  { kind: "boolean", key: "sport", label: "Sport" },
  { kind: "boolean", key: "restaurants", label: "Restaurace" },
  { kind: "boolean", key: "culture", label: "Kultura" },
  { kind: "boolean", key: "quiet", label: "Tiché prostředí" },
  { kind: "boolean", key: "parking_nearby", label: "Parkování v okolí" },
  { kind: "boolean", key: "family_friendly", label: "Vhodné pro děti" },
  { kind: "boolean", key: "senior_friendly", label: "Vhodné pro seniory" },
  { kind: "boolean", key: "pet_friendly", label: "Vhodné pro domácí zvířata" },
];

export const ALL_CRITERIA: Criterion[] = [
  ...FEATURE_SELECT_CRITERIA,
  ...FEATURE_FLAG_CRITERIA,
  ...LIFESTYLE_CRITERIA,
];

export function criterionByKey(key: string): Criterion | undefined {
  return ALL_CRITERIA.find((c) => c.key === key);
}

export function criterionLabel(key: string): string {
  return criterionByKey(key)?.label ?? key;
}

/** Human-readable value of a stored preference (e.g. "Družstevní" or "Ano"). */
export function preferenceValueLabel(key: string, value: string): string {
  const criterion = criterionByKey(key);
  if (criterion?.kind === "select") {
    return criterion.options.find((o) => o.value === value)?.label ?? value;
  }
  return value === "true" ? "Ano" : value;
}

// ---------------------------------------------------------------------------
// Label helpers
// ---------------------------------------------------------------------------

export function purposeLabel(purpose: SearchPurpose): string {
  return SEARCH_PURPOSES.find((p) => p.value === purpose)?.label ?? purpose;
}

export function propertyTypeLabel(type: DesiredPropertyType): string {
  return DESIRED_PROPERTY_TYPES.find((t) => t.value === type)?.label ?? type;
}

export function dispositionLabel(disposition: Disposition): string {
  return DISPOSITIONS.find((d) => d.value === disposition)?.label ?? disposition;
}

export function transportModeLabel(mode: TransportMode): string {
  return TRANSPORT_MODES.find((m) => m.value === mode)?.label ?? mode;
}
