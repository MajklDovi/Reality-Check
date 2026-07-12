import type {
  ConstructionType,
  EnergyClass,
  ListingStatus,
  OwnershipType,
  PropertyCondition,
  PropertyType,
  SellerType,
} from "@/generated/prisma/enums";

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "APARTMENT", label: "Byt" },
  { value: "HOUSE", label: "Dům" },
  { value: "LAND", label: "Pozemek" },
  { value: "COMMERCIAL", label: "Komerční prostor" },
  { value: "GARAGE", label: "Garáž" },
  { value: "OTHER", label: "Jiné" },
];

export const OWNERSHIP_TYPES: { value: OwnershipType; label: string }[] = [
  { value: "UNKNOWN", label: "Neuvedeno" },
  { value: "PERSONAL", label: "Osobní" },
  { value: "COOPERATIVE", label: "Družstevní" },
  { value: "MUNICIPAL", label: "Obecní / státní" },
  { value: "OTHER", label: "Jiné" },
];

export const PROPERTY_CONDITIONS: { value: PropertyCondition; label: string }[] = [
  { value: "UNKNOWN", label: "Neuvedeno" },
  { value: "NEW_BUILD", label: "Novostavba" },
  { value: "EXCELLENT", label: "Výborný" },
  { value: "GOOD", label: "Dobrý" },
  { value: "NEEDS_RENOVATION", label: "Před rekonstrukcí" },
  { value: "UNDER_CONSTRUCTION", label: "Ve výstavbě" },
  { value: "DEMOLITION", label: "K demolici" },
];

export const ENERGY_CLASSES: { value: EnergyClass; label: string }[] = [
  { value: "UNKNOWN", label: "Neuvedeno" },
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
];

export const CONSTRUCTION_TYPES: { value: ConstructionType; label: string }[] = [
  { value: "UNKNOWN", label: "Neuvedeno" },
  { value: "BRICK", label: "Cihlová" },
  { value: "PANEL", label: "Panelová" },
  { value: "WOOD", label: "Dřevostavba" },
  { value: "SKELETON", label: "Skeletová" },
  { value: "MIXED", label: "Smíšená" },
  { value: "OTHER", label: "Jiná" },
];

export const SELLER_TYPES: { value: SellerType; label: string }[] = [
  { value: "UNKNOWN", label: "Neuvedeno" },
  { value: "AGENCY", label: "Realitní kancelář" },
  { value: "PRIVATE", label: "Soukromý prodejce" },
  { value: "DEVELOPER", label: "Developer" },
];

export const LISTING_STATUSES: {
  value: ListingStatus;
  label: string;
  badge: "success" | "default" | "warning" | "danger";
}[] = [
  { value: "ACTIVE", label: "Aktivní", badge: "success" },
  { value: "INACTIVE", label: "Neaktivní", badge: "default" },
  { value: "UNKNOWN", label: "Neznámý stav", badge: "warning" },
  { value: "REMOVED", label: "Staženo", badge: "danger" },
];

function labelOf<T extends string>(list: { value: T; label: string }[], value: T): string {
  return list.find((item) => item.value === value)?.label ?? value;
}

export const propertyTypeEnumLabel = (v: PropertyType) => labelOf(PROPERTY_TYPES, v);
export const ownershipTypeLabel = (v: OwnershipType) => labelOf(OWNERSHIP_TYPES, v);
export const conditionEnumLabel = (v: PropertyCondition) => labelOf(PROPERTY_CONDITIONS, v);
export const energyClassLabel = (v: EnergyClass) => labelOf(ENERGY_CLASSES, v);
export const constructionTypeLabel = (v: ConstructionType) => labelOf(CONSTRUCTION_TYPES, v);
export const sellerTypeLabel = (v: SellerType) => labelOf(SELLER_TYPES, v);

export function listingStatusInfo(value: ListingStatus) {
  return LISTING_STATUSES.find((s) => s.value === value) ?? LISTING_STATUSES[2];
}
