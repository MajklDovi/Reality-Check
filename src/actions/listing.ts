"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hostnameMatchesDomain, resolveAdapter } from "@/lib/source-adapters";
import { computeListingCompleteness, computePricePerSquareMeter } from "@/lib/listing-utils";
import {
  listingFormSchema,
  listingUrlSchema,
  type ListingFormData,
  type ListingMetadataPrefill,
} from "@/lib/validations/listing";
import { Prisma } from "@/generated/prisma/client";
import type { ListingStatus, Role } from "@/generated/prisma/enums";

export type ListingActionResult =
  { success: true; listingId?: string; info?: string } | { success: false; error: string };

const GENERIC_SOURCE_DOMAIN = "generic";

async function requireUser(): Promise<{ id: string; role: Role } | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, role: session.user.role };
}

/** Listing the current user may modify: its creator or an admin. */
async function findEditableListing(listingId: string, user: { id: string; role: Role }) {
  const listing = await prisma.propertyListing.findUnique({
    where: { id: listingId },
    include: { property: { select: { id: true, _count: { select: { listings: true } } } } },
  });
  if (!listing) return null;
  if (listing.addedByUserId !== user.id && user.role !== "ADMIN") return null;
  return listing;
}

function revalidateListingPaths(listingId?: string) {
  revalidatePath("/properties");
  revalidatePath("/dashboard");
  if (listingId) revalidatePath(`/properties/${listingId}`);
}

// ---------------------------------------------------------------------------
// URL metadata import
// ---------------------------------------------------------------------------

export async function fetchListingMetadataAction(
  rawUrl: unknown
): Promise<{ success: true; prefill: ListingMetadataPrefill } | { success: false; error: string }> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  const parsed = listingUrlSchema.safeParse(rawUrl);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Neplatná URL" };
  }

  const hostname = new URL(parsed.data).hostname;

  // Identify the source portal by domain; fall back to the generic source.
  const sources = await prisma.listingSource.findMany({ where: { isActive: true } });
  const source =
    sources.find(
      (s) => s.domain !== GENERIC_SOURCE_DOMAIN && hostnameMatchesDomain(hostname, s.domain)
    ) ?? sources.find((s) => s.domain === GENERIC_SOURCE_DOMAIN);

  if (!source) {
    return {
      success: false,
      error: "Není nakonfigurovaný žádný zdroj. Spusťte prosím seed (npm run db:seed).",
    };
  }

  const prefill: ListingMetadataPrefill = {
    sourceUrl: parsed.data,
    sourceId: source.id,
    sourceName: source.name,
    imageFromAllowedSource: false,
    metadataImported: false,
  };

  if (!source.allowMetadataImport) {
    prefill.message = "Zdroj nepovoluje automatický import metadat — vyplňte prosím údaje ručně.";
    return { success: true, prefill };
  }

  const adapter = resolveAdapter(hostname);
  const metadata = await adapter.fetchMetadata(parsed.data);

  if (metadata.title) {
    prefill.title = metadata.title;
    prefill.metadataImported = true;
  }
  if (metadata.previewImageUrl && source.allowPreviewImages) {
    prefill.previewImageUrl = metadata.previewImageUrl;
    prefill.imageFromAllowedSource = true;
  }
  if (metadata.externalId) {
    prefill.externalId = metadata.externalId;
  }
  if (metadata.canonicalUrl) {
    try {
      // Only adopt the canonical URL when it stays on the same portal
      // (same configured domain, or same host for the generic source).
      const canonicalHost = new URL(metadata.canonicalUrl).hostname;
      if (hostnameMatchesDomain(canonicalHost, source.domain) || canonicalHost === hostname) {
        prefill.sourceUrl = metadata.canonicalUrl;
      }
    } catch {
      // keep the original URL
    }
  }

  if (!prefill.metadataImported) {
    prefill.message =
      "Metadata se nepodařilo načíst — zkontrolujte prosím URL a vyplňte údaje ručně.";
  }

  return { success: true, prefill };
}

// ---------------------------------------------------------------------------
// Create & update
// ---------------------------------------------------------------------------

function propertyFieldsFrom(data: ListingFormData) {
  const flag = (value: boolean) => (value ? true : null);
  return {
    propertyType: data.propertyType,
    disposition: data.disposition,
    area: data.area ?? null,
    region: data.region?.trim() || null,
    district: data.district?.trim() || null,
    city: data.city?.trim() || null,
    cityPart: data.cityPart?.trim() || null,
    approximateAddress: data.approximateAddress?.trim() || null,
    ownershipType: data.ownershipType,
    condition: data.condition,
    floor: data.floor ?? null,
    totalFloors: data.totalFloors ?? null,
    hasElevator: flag(data.hasElevator),
    hasBalcony: flag(data.hasBalcony),
    hasLoggia: flag(data.hasLoggia),
    hasTerrace: flag(data.hasTerrace),
    hasGarden: flag(data.hasGarden),
    hasCellar: flag(data.hasCellar),
    hasGarage: flag(data.hasGarage),
    hasParking: flag(data.hasParking),
    energyClass: data.energyClass,
    constructionType: data.constructionType,
    yearBuilt: data.yearBuilt ?? null,
    yearRenovated: data.yearRenovated ?? null,
  };
}

function listingFieldsFrom(data: ListingFormData) {
  const completeness = computeListingCompleteness({
    price: data.price,
    area: data.area,
    city: data.city,
    propertyType: data.propertyType,
    disposition: data.disposition,
    ownershipType: data.ownershipType,
    condition: data.condition,
    sourceUrl: data.sourceUrl,
  });

  return {
    sourceUrl: data.sourceUrl,
    title: data.title.trim(),
    price: data.price ?? null,
    pricePerSquareMeter: computePricePerSquareMeter(data.price, data.area),
    commissionIncluded: data.commissionIncluded ? true : null,
    sellerType: data.sellerType,
    agencyName: data.agencyName?.trim() || null,
    monthlyCosts: data.monthlyCosts ?? null,
    userNote: data.userNote?.trim() || null,
    listingStatus: data.listingStatus,
    dataCompleteness: completeness,
    // An image is shown only when allowed metadata provided it, or the owner
    // supplied it manually — both arrive through this validated field.
    previewImageUrl: data.previewImageUrl || null,
    imageUsageAllowed: !!data.previewImageUrl,
    lastCheckedAt: new Date(),
  };
}

export async function createListingAction(input: unknown): Promise<ListingActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Zkontrolujte prosím vyplněné údaje",
    };
  }
  const data = parsed.data;

  const source = await prisma.listingSource.findFirst({
    where: { id: data.sourceId, isActive: true },
  });
  if (!source) return { success: false, error: "Vybraný zdroj neexistuje nebo není aktivní" };

  try {
    const listing = await prisma.propertyListing.create({
      data: {
        ...listingFieldsFrom(data),
        externalId: data.externalId?.trim() || null,
        source: { connect: { id: source.id } },
        addedByUser: { connect: { id: user.id } },
        property: { create: propertyFieldsFrom(data) },
        priceHistory: data.price != null ? { create: { price: data.price } } : undefined,
      },
    });

    revalidateListingPaths(listing.id);
    return { success: true, listingId: listing.id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        success: false,
        error: "Tato nabídka (stejné externí ID) už je v aplikaci uložena.",
      };
    }
    throw error;
  }
}

export async function updateListingAction(
  listingId: string,
  input: unknown
): Promise<ListingActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  const parsed = listingFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Zkontrolujte prosím vyplněné údaje",
    };
  }
  const data = parsed.data;

  const listing = await findEditableListing(listingId, user);
  if (!listing) return { success: false, error: "Nabídka nebyla nalezena nebo k ní nemáte práva" };

  const source = await prisma.listingSource.findFirst({
    where: { id: data.sourceId, isActive: true },
  });
  if (!source) return { success: false, error: "Vybraný zdroj neexistuje nebo není aktivní" };

  const priceChanged =
    data.price != null && (listing.price == null || !listing.price.equals(data.price));

  await prisma.$transaction([
    prisma.property.update({
      where: { id: listing.propertyId },
      data: propertyFieldsFrom(data),
    }),
    prisma.propertyListing.update({
      where: { id: listingId },
      data: {
        ...listingFieldsFrom(data),
        sourceId: source.id,
        priceHistory: priceChanged ? { create: { price: data.price! } } : undefined,
      },
    }),
  ]);

  revalidateListingPaths(listingId);
  return { success: true, listingId };
}

// ---------------------------------------------------------------------------
// Status & deletion
// ---------------------------------------------------------------------------

export async function setListingStatusAction(
  listingId: string,
  status: ListingStatus
): Promise<ListingActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  if (!["ACTIVE", "INACTIVE", "UNKNOWN", "REMOVED"].includes(status)) {
    return { success: false, error: "Neplatný stav nabídky" };
  }

  const listing = await findEditableListing(listingId, user);
  if (!listing) return { success: false, error: "Nabídka nebyla nalezena nebo k ní nemáte práva" };

  await prisma.propertyListing.update({
    where: { id: listingId },
    data: { listingStatus: status, lastCheckedAt: new Date() },
  });

  revalidateListingPaths(listingId);
  return { success: true, listingId };
}

export async function deleteListingAction(listingId: string): Promise<ListingActionResult> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  const listing = await findEditableListing(listingId, user);
  if (!listing) return { success: false, error: "Nabídka nebyla nalezena nebo k ní nemáte práva" };

  if (listing.property._count.listings <= 1) {
    // Last listing of the property — remove the whole property (cascades).
    await prisma.property.delete({ where: { id: listing.propertyId } });
  } else {
    await prisma.propertyListing.delete({ where: { id: listingId } });
  }

  revalidateListingPaths();
  return { success: true };
}

// ---------------------------------------------------------------------------
// Save & compare toggles
// ---------------------------------------------------------------------------

export async function toggleSavedPropertyAction(
  propertyId: string
): Promise<{ success: true; saved: boolean } | { success: false; error: string }> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  const existing = await prisma.savedProperty.findUnique({
    where: { userId_propertyId: { userId: user.id, propertyId } },
  });

  if (existing) {
    await prisma.savedProperty.delete({ where: { id: existing.id } });
    revalidateListingPaths();
    return { success: true, saved: false };
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return { success: false, error: "Nemovitost nebyla nalezena" };

  await prisma.savedProperty.create({ data: { userId: user.id, propertyId } });
  revalidateListingPaths();
  return { success: true, saved: true };
}

const DEFAULT_COMPARISON_NAME = "Moje porovnání";

export async function toggleComparisonAction(
  propertyId: string
): Promise<{ success: true; inComparison: boolean } | { success: false; error: string }> {
  const user = await requireUser();
  if (!user) return { success: false, error: "Nejste přihlášeni" };

  let comparison = await prisma.propertyComparison.findFirst({
    where: { userId: user.id, name: DEFAULT_COMPARISON_NAME },
    include: { items: true },
  });
  if (!comparison) {
    comparison = await prisma.propertyComparison.create({
      data: { userId: user.id, name: DEFAULT_COMPARISON_NAME },
      include: { items: true },
    });
  }

  const existingItem = comparison.items.find((item) => item.propertyId === propertyId);
  if (existingItem) {
    await prisma.propertyComparisonItem.delete({ where: { id: existingItem.id } });
    revalidateListingPaths();
    return { success: true, inComparison: false };
  }

  const property = await prisma.property.findUnique({ where: { id: propertyId } });
  if (!property) return { success: false, error: "Nemovitost nebyla nalezena" };

  await prisma.propertyComparisonItem.create({
    data: {
      comparisonId: comparison.id,
      propertyId,
      position: comparison.items.length,
    },
  });
  revalidateListingPaths();
  return { success: true, inComparison: true };
}
