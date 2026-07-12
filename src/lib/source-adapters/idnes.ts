import { fetchOpenGraphMetadata } from "./open-graph";
import { hostnameMatchesDomain, type SourceAdapter } from "./types";

/**
 * Reality.iDNES.cz adapter — placeholder (domain identification + Open Graph).
 */
export const idnesRealityAdapter: SourceAdapter = {
  key: "idnes-reality",
  name: "Reality.iDNES.cz",
  matches: (hostname) => hostnameMatchesDomain(hostname, "reality.idnes.cz"),
  fetchMetadata: (url) => fetchOpenGraphMetadata(url),
};
