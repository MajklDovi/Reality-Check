import { fetchOpenGraphMetadata } from "./open-graph";
import type { SourceAdapter } from "./types";

/** Fallback adapter for any unrecognized source — Open Graph only. */
export const genericAdapter: SourceAdapter = {
  key: "generic",
  name: "Obecný zdroj",
  matches: () => true,
  fetchMetadata: (url) => fetchOpenGraphMetadata(url),
};
