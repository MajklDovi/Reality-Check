import { agencyAdapter } from "./agency";
import { bezrealitkyAdapter } from "./bezrealitky";
import { genericAdapter } from "./generic";
import { idnesRealityAdapter } from "./idnes";
import { srealityAdapter } from "./sreality";
import type { SourceAdapter } from "./types";

export { hostnameMatchesDomain } from "./types";
export type { FetchedMetadata, SourceAdapter } from "./types";

/** Ordered adapter registry — most specific first, generic fallback last. */
const ADAPTERS: SourceAdapter[] = [
  srealityAdapter,
  bezrealitkyAdapter,
  idnesRealityAdapter,
  agencyAdapter,
  genericAdapter,
];

export function resolveAdapter(hostname: string): SourceAdapter {
  return ADAPTERS.find((adapter) => adapter.matches(hostname)) ?? genericAdapter;
}
