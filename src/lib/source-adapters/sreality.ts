import { fetchOpenGraphMetadata } from "./open-graph";
import { hostnameMatchesDomain, type SourceAdapter } from "./types";

/**
 * Sreality.cz adapter — placeholder.
 * Currently: domain identification, Open Graph metadata and external id
 * from the URL. A structured integration (feed/API) belongs to a later phase
 * and must respect the portal's terms of service.
 */
export const srealityAdapter: SourceAdapter = {
  key: "sreality",
  name: "Sreality.cz",
  matches: (hostname) => hostnameMatchesDomain(hostname, "sreality.cz"),
  async fetchMetadata(url) {
    const metadata = await fetchOpenGraphMetadata(url);
    // Detail URLs end with a numeric listing id: /detail/prodej/byt/.../123456789
    const idMatch = new URL(url).pathname.match(/\/(\d{5,})\/?$/);
    if (idMatch) metadata.externalId = idMatch[1];
    return metadata;
  },
};
