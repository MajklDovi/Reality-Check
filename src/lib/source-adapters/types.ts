/** Metadata a source adapter may extract for a listing URL. */
export interface FetchedMetadata {
  title?: string;
  previewImageUrl?: string;
  canonicalUrl?: string;
  /** Listing id on the source portal, when derivable from the URL. */
  externalId?: string;
}

/**
 * A source adapter identifies a portal by domain and (optionally) loads
 * basic, publicly exposed metadata. Adapters must stay polite: a single
 * request, short timeout, bounded response size — no aggressive scraping.
 */
export interface SourceAdapter {
  key: string;
  /** Human-readable adapter name (for logging/diagnostics). */
  name: string;
  /** Whether this adapter handles the given hostname. */
  matches(hostname: string): boolean;
  /** Load available metadata; returns an empty object when nothing is available. */
  fetchMetadata(url: string): Promise<FetchedMetadata>;
}

/** hostname === domain or a subdomain of it. */
export function hostnameMatchesDomain(hostname: string, domain: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  const base = domain.toLowerCase().replace(/^www\./, "");
  return host === base || host.endsWith(`.${base}`);
}
