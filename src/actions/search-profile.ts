"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_PLAN, PLAN_LIMITS } from "@/config/plans";
import { wizardDataToPreferences } from "@/lib/search-profile-utils";
import {
  searchProfileWizardSchema,
  wizardDraftSchema,
  type SearchProfileWizardData,
} from "@/lib/validations/search-profile";
import type { Prisma, SubscriptionPlan } from "@/generated/prisma/client";

export type ProfileActionResult =
  { success: true; profileId?: string; info?: string } | { success: false; error: string };

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

async function getUserPlan(userId: string): Promise<SubscriptionPlan> {
  const subscription = await prisma.subscription.findFirst({
    where: { userId, status: { in: ["ACTIVE", "TRIALING"] } },
    orderBy: { createdAt: "desc" },
  });
  return subscription?.plan ?? DEFAULT_PLAN;
}

/** Map validated wizard data to SearchProfile columns. */
function wizardDataToProfileFields(data: SearchProfileWizardData) {
  return {
    name: data.name,
    purpose: data.purpose,
    idealPrice: data.idealPrice ?? null,
    maximumPrice: data.maximumPrice,
    ownSavings: data.ownSavings ?? null,
    plannedMortgage: data.plannedMortgage ?? null,
    netMonthlyIncome: data.netMonthlyIncome ?? null,
    existingMonthlyPayments: data.existingMonthlyPayments ?? null,
    maximumMonthlyPayment: data.maximumMonthlyPayment ?? null,
    financialReserve: data.financialReserve ?? null,
    renovationBudget: data.renovationBudget ?? null,
    furnishingBudget: data.furnishingBudget ?? null,
    propertyTypes: data.propertyTypes,
    dispositions: data.dispositions,
    minimumArea: data.minimumArea ?? null,
    maximumArea: data.maximumArea ?? null,
    minimumRooms: data.minimumRooms ?? null,
    maximumRooms: data.maximumRooms ?? null,
    preferredRegions: data.preferredRegions,
    preferredCities: data.preferredCities,
    preferredCityParts: data.preferredCityParts,
    excludedLocations: data.excludedLocations,
    maximumCommuteMinutes: data.maximumCommuteMinutes ?? null,
    commuteDestination: data.commuteDestination || null,
    transportMode: data.transportMode || null,
  };
}

function revalidateProfilePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/search-profiles");
}

// ---------------------------------------------------------------------------
// Onboarding draft
// ---------------------------------------------------------------------------

export async function saveOnboardingDraftAction(
  data: unknown,
  currentStep: number
): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const parsed = wizardDraftSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Rozpracovaná data se nepodařilo uložit" };
  }

  const step = Math.max(0, Math.min(7, Math.trunc(currentStep)));
  await prisma.onboardingDraft.upsert({
    where: { userId },
    update: { data: parsed.data as Prisma.InputJsonValue, currentStep: step },
    create: { userId, data: parsed.data as Prisma.InputJsonValue, currentStep: step },
  });

  return { success: true };
}

export async function discardOnboardingDraftAction(): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  await prisma.onboardingDraft.deleteMany({ where: { userId } });
  return { success: true };
}

// ---------------------------------------------------------------------------
// Create (complete onboarding) & update
// ---------------------------------------------------------------------------

export async function completeOnboardingAction(data: unknown): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const parsed = searchProfileWizardSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Zkontrolujte prosím vyplněné údaje",
    };
  }

  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  const [totalCount, activeCount] = await Promise.all([
    prisma.searchProfile.count({ where: { userId } }),
    prisma.searchProfile.count({ where: { userId, isActive: true } }),
  ]);

  if (totalCount >= limits.maxSearchProfiles) {
    return {
      success: false,
      error: `Váš plán umožňuje nejvýše ${limits.maxSearchProfiles} profilů. Odstraňte prosím některý stávající.`,
    };
  }

  const canBeActive = activeCount < limits.maxActiveSearchProfiles;
  const preferences = wizardDataToPreferences(parsed.data);

  const profile = await prisma.searchProfile.create({
    data: {
      userId,
      ...wizardDataToProfileFields(parsed.data),
      isActive: canBeActive,
      isDefault: totalCount === 0,
      preferences: { create: preferences },
    },
  });

  await prisma.onboardingDraft.deleteMany({ where: { userId } });
  revalidateProfilePaths();

  return {
    success: true,
    profileId: profile.id,
    info: canBeActive
      ? undefined
      : "Profil byl vytvořen jako neaktivní — váš plán už má maximum aktivních profilů.",
  };
}

export async function updateSearchProfileAction(
  profileId: string,
  data: unknown
): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const parsed = searchProfileWizardSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Zkontrolujte prosím vyplněné údaje",
    };
  }

  const existing = await prisma.searchProfile.findFirst({
    where: { id: profileId, userId },
    select: { id: true },
  });
  if (!existing) return { success: false, error: "Profil nebyl nalezen" };

  const preferences = wizardDataToPreferences(parsed.data);

  await prisma.$transaction([
    prisma.preference.deleteMany({ where: { searchProfileId: profileId } }),
    prisma.searchProfile.update({
      where: { id: profileId },
      data: {
        ...wizardDataToProfileFields(parsed.data),
        preferences: { create: preferences },
      },
    }),
  ]);

  revalidateProfilePaths();
  revalidatePath(`/search-profiles/${profileId}`);
  return { success: true, profileId };
}

// ---------------------------------------------------------------------------
// Profile management
// ---------------------------------------------------------------------------

export async function duplicateSearchProfileAction(
  profileId: string
): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const source = await prisma.searchProfile.findFirst({
    where: { id: profileId, userId },
    include: { preferences: true },
  });
  if (!source) return { success: false, error: "Profil nebyl nalezen" };

  const plan = await getUserPlan(userId);
  const totalCount = await prisma.searchProfile.count({ where: { userId } });
  if (totalCount >= PLAN_LIMITS[plan].maxSearchProfiles) {
    return {
      success: false,
      error: `Váš plán umožňuje nejvýše ${PLAN_LIMITS[plan].maxSearchProfiles} profilů.`,
    };
  }

  const { preferences, ...sourceFields } = source;
  const fields: Omit<typeof sourceFields, "id" | "createdAt" | "updatedAt"> & {
    id?: string;
    createdAt?: Date;
    updatedAt?: Date;
  } = { ...sourceFields };
  delete fields.id;
  delete fields.createdAt;
  delete fields.updatedAt;

  const copy = await prisma.searchProfile.create({
    data: {
      ...fields,
      name: `${source.name} (kopie)`,
      isActive: false,
      isDefault: false,
      preferences: {
        create: preferences.map(({ key, value, priority, isRequired }) => ({
          key,
          value,
          priority,
          isRequired,
        })),
      },
    },
  });

  revalidateProfilePaths();
  return { success: true, profileId: copy.id, info: "Kopie byla vytvořena jako neaktivní." };
}

export async function setSearchProfileActiveAction(
  profileId: string,
  isActive: boolean
): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const profile = await prisma.searchProfile.findFirst({
    where: { id: profileId, userId },
    select: { id: true, isActive: true },
  });
  if (!profile) return { success: false, error: "Profil nebyl nalezen" };

  if (isActive && !profile.isActive) {
    const plan = await getUserPlan(userId);
    const activeCount = await prisma.searchProfile.count({ where: { userId, isActive: true } });
    if (activeCount >= PLAN_LIMITS[plan].maxActiveSearchProfiles) {
      return {
        success: false,
        error: `Váš plán umožňuje nejvýše ${PLAN_LIMITS[plan].maxActiveSearchProfiles} aktivních profilů. Nejprve deaktivujte jiný profil.`,
      };
    }
  }

  await prisma.searchProfile.update({ where: { id: profileId }, data: { isActive } });
  revalidateProfilePaths();
  revalidatePath(`/search-profiles/${profileId}`);
  return { success: true, profileId };
}

export async function setDefaultSearchProfileAction(
  profileId: string
): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const profile = await prisma.searchProfile.findFirst({
    where: { id: profileId, userId },
    select: { id: true },
  });
  if (!profile) return { success: false, error: "Profil nebyl nalezen" };

  await prisma.$transaction([
    prisma.searchProfile.updateMany({ where: { userId }, data: { isDefault: false } }),
    prisma.searchProfile.update({ where: { id: profileId }, data: { isDefault: true } }),
  ]);

  revalidateProfilePaths();
  revalidatePath(`/search-profiles/${profileId}`);
  return { success: true, profileId };
}

export async function deleteSearchProfileAction(profileId: string): Promise<ProfileActionResult> {
  const userId = await requireUserId();
  if (!userId) return { success: false, error: "Nejste přihlášeni" };

  const profile = await prisma.searchProfile.findFirst({
    where: { id: profileId, userId },
    select: { id: true, isDefault: true },
  });
  if (!profile) return { success: false, error: "Profil nebyl nalezen" };

  await prisma.searchProfile.delete({ where: { id: profileId } });

  // Keep exactly one default profile if any remain.
  if (profile.isDefault) {
    const next = await prisma.searchProfile.findFirst({
      where: { userId },
      orderBy: [{ isActive: "desc" }, { createdAt: "asc" }],
      select: { id: true },
    });
    if (next) {
      await prisma.searchProfile.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  revalidateProfilePaths();
  return { success: true };
}
