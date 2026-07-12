import type { Preference, SearchProfile } from "@/generated/prisma/client";
import {
  DEFAULT_PRIORITY_LEVEL,
  FEATURE_FLAG_CRITERIA,
  FEATURE_SELECT_CRITERIA,
  LIFESTYLE_CRITERIA,
  levelFromPreference,
  priorityWeight,
  type PriorityLevel,
} from "@/lib/search-criteria";
import type { WizardDraftData } from "@/lib/validations/search-profile";

/** SearchProfile with Decimal fields converted to plain numbers (client-safe). */
export interface PlainSearchProfile extends Omit<
  SearchProfile,
  | "minimumPrice"
  | "idealPrice"
  | "maximumPrice"
  | "ownSavings"
  | "plannedMortgage"
  | "netMonthlyIncome"
  | "existingMonthlyPayments"
  | "maximumMonthlyPayment"
  | "financialReserve"
  | "renovationBudget"
  | "furnishingBudget"
> {
  minimumPrice: number | null;
  idealPrice: number | null;
  maximumPrice: number | null;
  ownSavings: number | null;
  plannedMortgage: number | null;
  netMonthlyIncome: number | null;
  existingMonthlyPayments: number | null;
  maximumMonthlyPayment: number | null;
  financialReserve: number | null;
  renovationBudget: number | null;
  furnishingBudget: number | null;
}

export function toPlainSearchProfile(profile: SearchProfile): PlainSearchProfile {
  return {
    ...profile,
    minimumPrice: profile.minimumPrice?.toNumber() ?? null,
    idealPrice: profile.idealPrice?.toNumber() ?? null,
    maximumPrice: profile.maximumPrice?.toNumber() ?? null,
    ownSavings: profile.ownSavings?.toNumber() ?? null,
    plannedMortgage: profile.plannedMortgage?.toNumber() ?? null,
    netMonthlyIncome: profile.netMonthlyIncome?.toNumber() ?? null,
    existingMonthlyPayments: profile.existingMonthlyPayments?.toNumber() ?? null,
    maximumMonthlyPayment: profile.maximumMonthlyPayment?.toNumber() ?? null,
    financialReserve: profile.financialReserve?.toNumber() ?? null,
    renovationBudget: profile.renovationBudget?.toNumber() ?? null,
    furnishingBudget: profile.furnishingBudget?.toNumber() ?? null,
  };
}

const FEATURE_KEYS = new Set([
  ...FEATURE_SELECT_CRITERIA.map((c) => c.key),
  ...FEATURE_FLAG_CRITERIA.map((c) => c.key),
]);
const LIFESTYLE_KEYS = new Set(LIFESTYLE_CRITERIA.map((c) => c.key));

export interface CompletenessSection {
  key: string;
  label: string;
  done: boolean;
}

/** How complete a search profile is (0–100) + which sections are filled. */
export function computeProfileCompleteness(
  profile: PlainSearchProfile,
  preferences: Pick<Preference, "key">[]
): { percent: number; sections: CompletenessSection[] } {
  const hasFeature = preferences.some((p) => FEATURE_KEYS.has(p.key));
  const hasLifestyle = preferences.some((p) => LIFESTYLE_KEYS.has(p.key));

  const sections: CompletenessSection[] = [
    { key: "purpose", label: "Účel hledání", done: !!profile.purpose },
    { key: "budget", label: "Rozpočet", done: profile.maximumPrice != null },
    {
      key: "financing",
      label: "Financování",
      done: profile.ownSavings != null || profile.netMonthlyIncome != null,
    },
    { key: "types", label: "Typ nemovitosti", done: profile.propertyTypes.length > 0 },
    {
      key: "location",
      label: "Lokalita",
      done: profile.preferredRegions.length > 0 || profile.preferredCities.length > 0,
    },
    {
      key: "size",
      label: "Velikost a dispozice",
      done:
        profile.minimumArea != null ||
        profile.maximumArea != null ||
        profile.dispositions.length > 0 ||
        profile.minimumRooms != null,
    },
    { key: "features", label: "Vlastnosti", done: hasFeature },
    { key: "lifestyle", label: "Životní styl", done: hasLifestyle },
  ];

  const done = sections.filter((s) => s.done).length;
  return { percent: Math.round((done / sections.length) * 100), sections };
}

// ---------------------------------------------------------------------------
// Wizard data <-> database mapping
// ---------------------------------------------------------------------------

/** Build Preference create-rows from wizard data (steps 6–8). */
export function wizardDataToPreferences(data: WizardDraftData): {
  key: string;
  value: string;
  priority: number;
  isRequired: boolean;
}[] {
  const priorities = data.priorities ?? {};
  const rows: { key: string; value: string; priority: number; isRequired: boolean }[] = [];

  const push = (key: string, value: string) => {
    const level: PriorityLevel = priorities[key] ?? DEFAULT_PRIORITY_LEVEL;
    rows.push({
      key,
      value,
      priority: priorityWeight(level),
      isRequired: level === "MUST_HAVE",
    });
  };

  for (const criterion of FEATURE_SELECT_CRITERIA) {
    const value = data[criterion.key as "ownership" | "condition" | "floor"] as string | undefined;
    const mapped = criterion.key === "energy_class" ? data.energyClass : value;
    if (mapped && mapped !== criterion.anyValue) {
      push(criterion.key, mapped);
    }
  }

  for (const key of data.features ?? []) {
    if (FEATURE_KEYS.has(key)) push(key, "true");
  }
  for (const key of data.lifestyle ?? []) {
    if (LIFESTYLE_KEYS.has(key)) push(key, "true");
  }

  return rows;
}

/** Reconstruct wizard data from a stored profile + preferences (for editing). */
export function profileToWizardData(
  profile: PlainSearchProfile,
  preferences: Preference[]
): WizardDraftData {
  const features: string[] = [];
  const lifestyle: string[] = [];
  const priorities: Record<string, PriorityLevel> = {};
  let ownership: "ANY" | "PERSONAL" | "COOPERATIVE" = "ANY";
  let condition: "ANY" | "NEW_BUILD" | "EXCELLENT" | "GOOD" | "NEEDS_RENOVATION" = "ANY";
  let floor: "ANY" | "NOT_GROUND" | "LOW" | "HIGH" = "ANY";
  let energyClass: "ANY" | "A" | "B" | "C" | "D" | "E" = "ANY";

  for (const pref of preferences) {
    priorities[pref.key] = levelFromPreference(pref.priority, pref.isRequired);
    if (pref.key === "ownership") {
      ownership = pref.value as typeof ownership;
    } else if (pref.key === "condition") {
      condition = pref.value as typeof condition;
    } else if (pref.key === "floor") {
      floor = pref.value as typeof floor;
    } else if (pref.key === "energy_class") {
      energyClass = pref.value as typeof energyClass;
    } else if (FEATURE_KEYS.has(pref.key)) {
      features.push(pref.key);
    } else if (LIFESTYLE_KEYS.has(pref.key)) {
      lifestyle.push(pref.key);
    }
  }

  return {
    name: profile.name,
    purpose: profile.purpose,
    idealPrice: profile.idealPrice ?? undefined,
    maximumPrice: profile.maximumPrice ?? undefined,
    ownSavings: profile.ownSavings ?? undefined,
    plannedMortgage: profile.plannedMortgage ?? undefined,
    netMonthlyIncome: profile.netMonthlyIncome ?? undefined,
    existingMonthlyPayments: profile.existingMonthlyPayments ?? undefined,
    maximumMonthlyPayment: profile.maximumMonthlyPayment ?? undefined,
    financialReserve: profile.financialReserve ?? undefined,
    renovationBudget: profile.renovationBudget ?? undefined,
    furnishingBudget: profile.furnishingBudget ?? undefined,
    propertyTypes: profile.propertyTypes,
    preferredRegions: profile.preferredRegions,
    preferredCities: profile.preferredCities,
    preferredCityParts: profile.preferredCityParts,
    excludedLocations: profile.excludedLocations,
    commuteDestination: profile.commuteDestination ?? "",
    maximumCommuteMinutes: profile.maximumCommuteMinutes ?? undefined,
    transportMode: profile.transportMode ?? "",
    minimumArea: profile.minimumArea ?? undefined,
    maximumArea: profile.maximumArea ?? undefined,
    dispositions: profile.dispositions.filter((d) => d !== "UNKNOWN") as Exclude<
      (typeof profile.dispositions)[number],
      "UNKNOWN"
    >[],
    minimumRooms: profile.minimumRooms ?? undefined,
    maximumRooms: profile.maximumRooms ?? undefined,
    ownership,
    condition,
    floor,
    energyClass,
    features,
    lifestyle,
    priorities,
  };
}

/** Format a CZK amount for display (e.g. "6 190 000 Kč"). */
export function formatCzk(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return `${new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 0 }).format(amount)} Kč`;
}
