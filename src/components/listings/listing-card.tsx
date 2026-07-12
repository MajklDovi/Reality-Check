import Link from "next/link";
import type { Disposition, ListingStatus, PropertyType } from "@/generated/prisma/enums";
import { dispositionLabel } from "@/lib/search-criteria";
import { propertyTypeEnumLabel, listingStatusInfo } from "@/lib/property-labels";
import { completenessLevel, formatLocation } from "@/lib/listing-utils";
import { formatCzk } from "@/lib/search-profile-utils";
import { Badge, Button, Card } from "@/components/ui";
import { ListingPreview } from "./listing-preview";
import { ListingCardActions } from "./listing-card-actions";

export interface ListingCardData {
  id: string;
  title: string;
  sourceUrl: string;
  sourceName: string;
  previewImageUrl: string | null;
  imageUsageAllowed: boolean;
  price: number | null;
  pricePerSquareMeter: number | null;
  listingStatus: ListingStatus;
  dataCompleteness: number;
  property: {
    id: string;
    propertyType: PropertyType;
    disposition: Disposition;
    area: number | null;
    city: string | null;
    cityPart: string | null;
    district: string | null;
    region: string | null;
  };
  saved: boolean;
  inComparison: boolean;
}

export function ListingCard({ listing }: { listing: ListingCardData }) {
  const status = listingStatusInfo(listing.listingStatus);
  const completeness = completenessLevel(listing.dataCompleteness);
  const { property } = listing;

  return (
    <Card className="flex flex-col overflow-hidden">
      <Link href={`/properties/${listing.id}`} aria-label={`Detail: ${listing.title}`}>
        <ListingPreview
          previewImageUrl={listing.previewImageUrl}
          imageUsageAllowed={listing.imageUsageAllowed}
          propertyType={property.propertyType}
          title={listing.title}
        />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={status.badge}>{status.label}</Badge>
          <Badge variant={completeness.badge}>{completeness.label}</Badge>
        </div>

        <div>
          <Link
            href={`/properties/${listing.id}`}
            className="line-clamp-2 font-semibold text-zinc-900 hover:underline dark:text-zinc-50"
          >
            {listing.title}
          </Link>
          <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
            {[
              property.disposition !== "UNKNOWN" ? dispositionLabel(property.disposition) : null,
              propertyTypeEnumLabel(property.propertyType),
              formatLocation(property),
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>

        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {formatCzk(listing.price)}
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {listing.pricePerSquareMeter != null
              ? `${formatCzk(listing.pricePerSquareMeter)}/m²`
              : ""}
            {listing.pricePerSquareMeter != null && property.area != null ? " · " : ""}
            {property.area != null ? `${property.area} m²` : ""}
          </p>
        </div>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">Zdroj: {listing.sourceName}</p>

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <Link href={`/properties/${listing.id}`}>
            <Button size="sm">Detail</Button>
          </Link>
          <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              Původní inzerát ↗
            </Button>
          </a>
          <ListingCardActions
            propertyId={property.id}
            initialSaved={listing.saved}
            initialInComparison={listing.inComparison}
          />
        </div>
      </div>
    </Card>
  );
}
