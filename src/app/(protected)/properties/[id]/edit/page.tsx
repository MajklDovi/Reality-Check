import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/listings/listing-form";
import type { ListingFormInput } from "@/lib/validations/listing";

export const metadata: Metadata = {
  title: "Upravit nabídku",
};

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session!.user;
  const { id } = await params;

  const [listing, sources, regions] = await Promise.all([
    prisma.propertyListing.findUnique({
      where: { id },
      include: { property: true },
    }),
    prisma.listingSource.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.region.findMany({ orderBy: { sortOrder: "asc" }, select: { name: true } }),
  ]);

  if (!listing) notFound();
  if (listing.addedByUserId !== user.id && user.role !== "ADMIN") notFound();

  const property = listing.property;
  const defaultValues: Partial<ListingFormInput> = {
    sourceUrl: listing.sourceUrl,
    sourceId: listing.sourceId,
    title: listing.title,
    previewImageUrl: listing.previewImageUrl ?? "",
    externalId: listing.externalId ?? "",
    propertyType: property.propertyType,
    disposition: property.disposition,
    area: property.area ?? undefined,
    price: listing.price?.toNumber() ?? undefined,
    monthlyCosts: listing.monthlyCosts?.toNumber() ?? undefined,
    region: property.region ?? "",
    district: property.district ?? "",
    city: property.city ?? "",
    cityPart: property.cityPart ?? "",
    approximateAddress: property.approximateAddress ?? "",
    ownershipType: property.ownershipType,
    condition: property.condition,
    floor: property.floor ?? undefined,
    totalFloors: property.totalFloors ?? undefined,
    hasElevator: property.hasElevator === true,
    hasBalcony: property.hasBalcony === true,
    hasLoggia: property.hasLoggia === true,
    hasTerrace: property.hasTerrace === true,
    hasGarden: property.hasGarden === true,
    hasCellar: property.hasCellar === true,
    hasGarage: property.hasGarage === true,
    hasParking: property.hasParking === true,
    energyClass: property.energyClass,
    constructionType: property.constructionType,
    yearBuilt: property.yearBuilt ?? undefined,
    yearRenovated: property.yearRenovated ?? undefined,
    commissionIncluded: listing.commissionIncluded === true,
    agencyName: listing.agencyName ?? "",
    sellerType: listing.sellerType,
    userNote: listing.userNote ?? "",
    listingStatus: listing.listingStatus,
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Upravit nabídku</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">{listing.title}</p>
      </div>
      <ListingForm
        mode="edit"
        listingId={listing.id}
        sources={sources}
        regions={regions.map((r) => r.name)}
        defaultValues={defaultValues}
      />
    </div>
  );
}
