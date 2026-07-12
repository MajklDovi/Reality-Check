import { fetchOpenGraphMetadata } from "./open-graph";
import { hostnameMatchesDomain, type SourceAdapter } from "./types";

/** Domains of known real-estate agencies handled by the generic agency adapter. */
const AGENCY_DOMAINS = ["remax-czech.cz", "mmreality.cz", "reality.cz"];

/**
 * Generic adapter for real-estate agency websites (RE/MAX, M&M Reality, …).
 * Agencies expose standard Open Graph tags on listing detail pages.
 */
export const agencyAdapter: SourceAdapter = {
  key: "agency-generic",
  name: "Realitní kancelář (obecný)",
  matches: (hostname) => AGENCY_DOMAINS.some((domain) => hostnameMatchesDomain(hostname, domain)),
  fetchMetadata: (url) => fetchOpenGraphMetadata(url),
};
