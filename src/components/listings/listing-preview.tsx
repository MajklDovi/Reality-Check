import type { PropertyType } from "@/generated/prisma/enums";
import { cn } from "@/lib/utils";

const PLACEHOLDER_ICONS: Record<PropertyType, React.ReactNode> = {
  APARTMENT: (
    // building
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 21h18M5 21V5a2 2 0 012-2h6a2 2 0 012 2v16m-6-12h.01M9 13h.01M9 17h.01M12 9h.01M12 13h.01M12 17h.01M15 21v-6a2 2 0 012-2h2a2 2 0 012 2v6"
    />
  ),
  HOUSE: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 12l9-8 9 8M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  ),
  LAND: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
    />
  ),
  COMMERCIAL: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  ),
  GARAGE: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 21V8l9-5 9 5v13M7 21v-8h10v8M7 17h10"
    />
  ),
  OTHER: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819"
    />
  ),
};

export interface ListingPreviewProps {
  previewImageUrl: string | null;
  imageUsageAllowed: boolean;
  propertyType: PropertyType;
  title: string;
  className?: string;
}

/**
 * Preview image of a listing. The external image renders ONLY when its usage
 * is allowed (allowed source metadata or manual input by the owning user) —
 * otherwise a neutral placeholder based on the property type is shown.
 * External images are hot-linked, never stored locally.
 */
export function ListingPreview({
  previewImageUrl,
  imageUsageAllowed,
  propertyType,
  title,
  className,
}: ListingPreviewProps) {
  const showImage = !!previewImageUrl && imageUsageAllowed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- external hot-linked image, domain unknown at build time
      <img
        src={previewImageUrl}
        alt={title}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={cn("h-44 w-full rounded-t-xl object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-label={`Náhled není k dispozici — ${title}`}
      className={cn(
        "flex h-44 w-full items-center justify-center rounded-t-xl",
        "bg-gradient-to-br from-indigo-50 to-zinc-100 text-indigo-300",
        "dark:from-zinc-800 dark:to-zinc-900 dark:text-zinc-600",
        className
      )}
    >
      <svg className="size-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {PLACEHOLDER_ICONS[propertyType]}
      </svg>
    </div>
  );
}
