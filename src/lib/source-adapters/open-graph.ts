import "server-only";
import type { FetchedMetadata } from "./types";

const FETCH_TIMEOUT_MS = 6000;
const MAX_BODY_BYTES = 512 * 1024; // read at most 512 KB of HTML
const USER_AGENT = "RealityCheckPreview/0.1 (single metadata request; no scraping)";

function decodeEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function extractMetaContent(html: string, property: string): string | undefined {
  // <meta property="og:title" content="..."> — attribute order varies.
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return undefined;
}

function extractCanonical(html: string): string | undefined {
  const patterns = [
    /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']*)["']/i,
    /<link[^>]+href=["']([^"']*)["'][^>]+rel=["']canonical["']/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1]);
  }
  return undefined;
}

function extractTitleTag(html: string): string | undefined {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match?.[1] ? decodeEntities(match[1]) : undefined;
}

async function readBounded(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let html = "";
  let received = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    html += decoder.decode(value, { stream: true });
    if (received >= MAX_BODY_BYTES || /<\/head>/i.test(html)) {
      await reader.cancel().catch(() => undefined);
      break;
    }
  }
  return html;
}

/**
 * Single polite GET for Open Graph metadata. Returns {} on any failure —
 * the caller then asks the user to fill the data manually.
 */
export async function fetchOpenGraphMetadata(url: string): Promise<FetchedMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      cache: "no-store",
    });

    if (!response.ok) return {};
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("html")) return {};

    const html = await readBounded(response);

    const title = extractMetaContent(html, "og:title") ?? extractTitleTag(html);
    const image = extractMetaContent(html, "og:image") ?? extractMetaContent(html, "twitter:image");
    const canonical = extractCanonical(html) ?? extractMetaContent(html, "og:url");

    const result: FetchedMetadata = {};
    if (title) result.title = title.slice(0, 200);
    if (image && /^https?:\/\//i.test(image)) result.previewImageUrl = image.slice(0, 2000);
    if (canonical && /^https?:\/\//i.test(canonical))
      result.canonicalUrl = canonical.slice(0, 2000);
    return result;
  } catch {
    return {};
  }
}
