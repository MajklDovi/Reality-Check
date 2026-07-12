import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard, type ListingCardData } from "@/components/listings/listing-card";
import { Button, EmptyState } from "@/components/ui";

export const metadata: Metadata = {
  title: "Moje nabídky",
};

export default async function PropertiesPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [listings, savedRows, comparison] = await Promise.all([
    prisma.propertyListing.findMany({
      where: { addedByUserId: userId },
      include: { property: true, source: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedProperty.findMany({ where: { userId }, select: { propertyId: true } }),
    prisma.propertyComparison.findFirst({
      where: { userId, name: "Moje porovnání" },
      include: { items: { select: { propertyId: true } } },
    }),
  ]);

  const savedIds = new Set(savedRows.map((row) => row.propertyId));
  const comparisonIds = new Set(comparison?.items.map((item) => item.propertyId) ?? []);

  const cards: ListingCardData[] = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    sourceUrl: listing.sourceUrl,
    sourceName: listing.source.name,
    previewImageUrl: listing.previewImageUrl,
    imageUsageAllowed: listing.imageUsageAllowed,
    price: listing.price?.toNumber() ?? null,
    pricePerSquareMeter: listing.pricePerSquareMeter?.toNumber() ?? null,
    listingStatus: listing.listingStatus,
    dataCompleteness: listing.dataCompleteness,
    property: {
      id: listing.property.id,
      propertyType: listing.property.propertyType,
      disposition: listing.property.disposition,
      area: listing.property.area,
      city: listing.property.city,
      cityPart: listing.property.cityPart,
      district: listing.property.district,
      region: listing.property.region,
    },
    saved: savedIds.has(listing.propertyId),
    inComparison: comparisonIds.has(listing.propertyId),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Moje nabídky</h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            Nabídky z realitních portálů, které sledujete. Vždy odkazují na původní inzerát.
          </p>
        </div>
        <Link href="/properties/new">
          <Button>+ Přidat nabídku</Button>
        </Link>
      </div>

      {cards.length === 0 ? (
        <EmptyState
          title="Zatím nesledujete žádnou nabídku"
          description="Vložte odkaz na inzerát z realitního portálu, nebo nabídku zadejte ručně. Údaje pak porovnáme s vaším profilem hledání."
          action={
            <Link href="/properties/new">
              <Button>Přidat první nabídku</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ListingCard key={card.id} listing={card} />
          ))}
        </div>
      )}
    </div>
  );
}
