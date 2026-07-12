import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dispositionLabel } from "@/lib/search-criteria";
import {
  conditionEnumLabel,
  constructionTypeLabel,
  energyClassLabel,
  listingStatusInfo,
  ownershipTypeLabel,
  propertyTypeEnumLabel,
  sellerTypeLabel,
} from "@/lib/property-labels";
import { completenessLevel, formatLocation } from "@/lib/listing-utils";
import { formatCzk } from "@/lib/search-profile-utils";
import { ListingPreview } from "@/components/listings/listing-preview";
import { ListingCardActions } from "@/components/listings/listing-card-actions";
import { ListingDetailActions } from "@/components/listings/listing-detail-actions";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Progress,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Detail nabídky",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-1.5">
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-zinc-900 dark:text-zinc-100">{value}</dd>
    </div>
  );
}

const yesNo = (value: boolean | null) => (value === true ? "Ano" : value === false ? "Ne" : "—");

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const user = session!.user;
  const { id } = await params;

  const listing = await prisma.propertyListing.findUnique({
    where: { id },
    include: {
      property: true,
      source: true,
      priceHistory: { orderBy: { recordedAt: "desc" }, take: 10 },
    },
  });
  if (!listing) notFound();
  // Listings are private to the user who added them (admins see everything).
  if (listing.addedByUserId !== user.id && user.role !== "ADMIN") notFound();

  const [saved, comparison] = await Promise.all([
    prisma.savedProperty.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId: listing.propertyId } },
      select: { id: true },
    }),
    prisma.propertyComparison.findFirst({
      where: { userId: user.id, name: "Moje porovnání" },
      include: { items: { where: { propertyId: listing.propertyId }, select: { id: true } } },
    }),
  ]);

  const property = listing.property;
  const status = listingStatusInfo(listing.listingStatus);
  const completeness = completenessLevel(listing.dataCompleteness);
  const price = listing.price?.toNumber() ?? null;
  const pricePerSqm = listing.pricePerSquareMeter?.toNumber() ?? null;
  const dateFormat = new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{listing.title}</h1>
            <Badge variant={status.badge}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">
            {[
              property.disposition !== "UNKNOWN" ? dispositionLabel(property.disposition) : null,
              propertyTypeEnumLabel(property.propertyType),
              formatLocation(property),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              ← Moje nabídky
            </Button>
          </Link>
          <Link href={`/properties/${listing.id}/edit`}>
            <Button variant="secondary" size="sm">
              Upravit
            </Button>
          </Link>
          <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer">
            <Button size="sm">Původní inzerát ↗</Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="overflow-hidden">
            <ListingPreview
              previewImageUrl={listing.previewImageUrl}
              imageUsageAllowed={listing.imageUsageAllowed}
              propertyType={property.propertyType}
              title={listing.title}
              className="h-64 rounded-t-xl"
            />
            <CardContent className="p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                  {formatCzk(price)}
                </p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  {pricePerSqm != null ? `${formatCzk(pricePerSqm)}/m²` : ""}
                  {pricePerSqm != null && property.area != null ? " · " : ""}
                  {property.area != null ? `${property.area} m²` : ""}
                </p>
              </div>
              {listing.monthlyCosts && (
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  Měsíční náklady: {formatCzk(listing.monthlyCosts.toNumber())}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parametry nemovitosti</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-x-10 sm:grid-cols-2">
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  <DetailRow label="Typ" value={propertyTypeEnumLabel(property.propertyType)} />
                  <DetailRow
                    label="Dispozice"
                    value={
                      property.disposition !== "UNKNOWN"
                        ? dispositionLabel(property.disposition)
                        : "—"
                    }
                  />
                  <DetailRow label="Výměra" value={property.area ? `${property.area} m²` : "—"} />
                  <DetailRow
                    label="Vlastnictví"
                    value={ownershipTypeLabel(property.ownershipType)}
                  />
                  <DetailRow label="Stav" value={conditionEnumLabel(property.condition)} />
                  <DetailRow
                    label="Podlaží"
                    value={
                      property.floor != null
                        ? `${property.floor}.${property.totalFloors ? ` z ${property.totalFloors}` : ""}`
                        : "—"
                    }
                  />
                  <DetailRow
                    label="Energetická třída"
                    value={energyClassLabel(property.energyClass)}
                  />
                  <DetailRow
                    label="Konstrukce"
                    value={constructionTypeLabel(property.constructionType)}
                  />
                  <DetailRow label="Rok výstavby" value={property.yearBuilt ?? "—"} />
                  <DetailRow label="Rok rekonstrukce" value={property.yearRenovated ?? "—"} />
                </div>
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  <DetailRow label="Výtah" value={yesNo(property.hasElevator)} />
                  <DetailRow label="Balkon" value={yesNo(property.hasBalcony)} />
                  <DetailRow label="Lodžie" value={yesNo(property.hasLoggia)} />
                  <DetailRow label="Terasa" value={yesNo(property.hasTerrace)} />
                  <DetailRow label="Zahrada" value={yesNo(property.hasGarden)} />
                  <DetailRow label="Sklep" value={yesNo(property.hasCellar)} />
                  <DetailRow label="Garáž" value={yesNo(property.hasGarage)} />
                  <DetailRow label="Parkování" value={yesNo(property.hasParking)} />
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lokalita</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <DetailRow label="Kraj" value={property.region ?? "—"} />
                <DetailRow label="Okres" value={property.district ?? "—"} />
                <DetailRow label="Město" value={property.city ?? "—"} />
                <DetailRow label="Městská část" value={property.cityPart ?? "—"} />
                <DetailRow label="Přibližná adresa" value={property.approximateAddress ?? "—"} />
              </dl>
            </CardContent>
          </Card>

          {/* Placeholder for the future AI analysis */}
          <Card>
            <CardHeader>
              <CardTitle>AI analýza</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState
                title="AI hodnocení připravujeme"
                description="V další fázi zde uvidíte skóre shody s vaším profilem hledání, hodnocení ceny, lokality a upozornění na rizika."
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Zdroj a data</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
                <DetailRow label="Zdroj" value={listing.source.name} />
                <DetailRow
                  label="Prodejce"
                  value={listing.agencyName ?? sellerTypeLabel(listing.sellerType)}
                />
                <DetailRow label="Provize v ceně" value={yesNo(listing.commissionIncluded)} />
                <DetailRow label="Přidáno" value={dateFormat.format(listing.firstSeenAt)} />
                <DetailRow
                  label="Poslední kontrola"
                  value={dateFormat.format(listing.lastCheckedAt)}
                />
              </dl>
              <div>
                <Progress value={Math.round(listing.dataCompleteness * 100)} label="Úplnost dat" />
                <Badge variant={completeness.badge} className="mt-2">
                  {completeness.label}
                </Badge>
              </div>
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full"
              >
                <Button variant="outline" className="w-full">
                  Přejít na původní inzerát ↗
                </Button>
              </a>
              <div className="flex gap-2">
                <ListingCardActions
                  propertyId={property.id}
                  initialSaved={!!saved}
                  initialInComparison={(comparison?.items.length ?? 0) > 0}
                />
              </div>
            </CardContent>
          </Card>

          {listing.priceHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Vývoj ceny</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {listing.priceHistory.map((entry) => (
                    <li key={entry.id} className="flex justify-between gap-3 py-2 text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {new Intl.DateTimeFormat("cs-CZ", { dateStyle: "medium" }).format(
                          entry.recordedAt
                        )}
                      </span>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatCzk(entry.price.toNumber())}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Vaše poznámky</CardTitle>
            </CardHeader>
            <CardContent>
              {listing.userNote ? (
                <p className="text-sm whitespace-pre-wrap text-zinc-700 dark:text-zinc-300">
                  {listing.userNote}
                </p>
              ) : (
                <p className="text-sm text-zinc-400 dark:text-zinc-500">
                  Žádné poznámky — přidáte je v úpravě nabídky.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Správa nabídky</CardTitle>
            </CardHeader>
            <CardContent>
              <ListingDetailActions
                listingId={listing.id}
                currentStatus={listing.listingStatus}
                listingTitle={listing.title}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
