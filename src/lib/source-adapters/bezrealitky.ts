import { fetchOpenGraphMetadata } from "./open-graph";
import { hostnameMatchesDomain, type SourceAdapter } from "./types";

/**
 * Bezrealitky.cz adapter — placeholder (domain identification + Open Graph).
 * Structured import may come later, subject to the portal's terms.
 */
export const bezrealitkyAdapter: SourceAdapter = {
  key: "bezrealitky",
  name: "Bezrealitky.cz",
  matches: (hostname) => hostnameMatchesDomain(hostname, "bezrealitky.cz"),
  async fetchMetadata(url) {
    const metadata = await fetchOpenGraphMetadata(url);
    // Detail URLs contain a numeric id segment: /nemovitosti-byty-domy/123456-...
    const idMatch = new URL(url).pathname.match(/\/(\d{5,})(?:-|\/|$)/);
    if (idMatch) metadata.externalId = idMatch[1];
    return metadata;
  },
};
