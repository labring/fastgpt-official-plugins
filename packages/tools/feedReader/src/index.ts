import { isIP } from "node:net";
import { parseStringPromise } from "xml2js";
import { z } from "zod";

const MAX_FEED_BYTES = 5 * 1024 * 1024;
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_REDIRECTS = 5;

const FeedFormatSchema = z.enum(["rss", "atom", "rdf", "json-feed"]);

const FeedInfoSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  siteUrl: z.string().optional(),
  feedUrl: z.string(),
  language: z.string().optional(),
  updatedAt: z.string().optional(),
  format: FeedFormatSchema,
});

const FeedItemSchema = z.object({
  title: z.string(),
  link: z.string().optional(),
  author: z.string().optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
  summary: z.string().optional(),
  content: z.string().optional(),
  id: z.string().optional(),
  categories: z.array(z.string()).optional(),
});

export const InputType = z.object({
  feedUrl: z.string().min(1),
  maxItems: z.number().int().min(1).max(50).default(10),
  includeContent: z.boolean().default(false),
});

export const OutputType = z.object({
  feed: FeedInfoSchema,
  items: z.array(FeedItemSchema),
  markdown: z.string(),
});

type Dict = Record<string, unknown>;
type FeedInfo = z.infer<typeof FeedInfoSchema>;
type FeedItem = z.infer<typeof FeedItemSchema>;
type Output = z.infer<typeof OutputType>;

type FetchFeedTextOptions = {
  timeoutMs?: number;
  maxBytes?: number;
  maxRedirects?: number;
  fetchImpl?: typeof fetch;
};

type FetchedFeed = {
  body: string;
  finalUrl: string;
  contentType?: string;
};

type ParseFeedInput = {
  body: string;
  feedUrl: string;
  finalUrl?: string;
  contentType?: string;
  maxItems: number;
  includeContent: boolean;
};

export function normalizeFeedUrl(feedUrl: string): string {
  const value = feedUrl.trim();

  if (value.startsWith("feed:https://") || value.startsWith("feed:http://")) {
    return value.slice("feed:".length);
  }

  for (const protocol of ["feed://", "rss://", "atom://"]) {
    if (value.startsWith(protocol)) {
      return `https://${value.slice(protocol.length)}`;
    }
  }

  return value;
}

export function validatePublicFeedUrl(feedUrl: string): string {
  let url: URL;

  try {
    url = new URL(normalizeFeedUrl(feedUrl));
  } catch {
    throw new Error("Invalid feed URL");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error(
      "Feed URL must use http, https, feed, rss, or atom protocol",
    );
  }

  if (url.username || url.password) {
    throw new Error("Feed URL must not contain username or password");
  }

  if (isPrivateHost(url.hostname)) {
    throw new Error(
      "Feed URL points to an internal or reserved network address",
    );
  }

  return url.toString();
}

export async function fetchFeedText(
  feedUrl: string,
  options: FetchFeedTextOptions = {},
): Promise<FetchedFeed> {
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = options.maxBytes ?? MAX_FEED_BYTES;
  const maxRedirects = options.maxRedirects ?? DEFAULT_MAX_REDIRECTS;
  const fetcher = options.fetchImpl ?? fetch;
  let currentUrl = validatePublicFeedUrl(feedUrl);

  for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
    const response = await fetcher(currentUrl, {
      method: "GET",
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        accept:
          "application/rss+xml, application/atom+xml, application/feed+json, application/json, application/xml, text/xml, */*;q=0.8",
        "user-agent": "FastGPT Feed Reader/1.0",
      },
    });

    if (isRedirect(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        throw new Error("Feed redirect response is missing Location header");
      }
      currentUrl = validatePublicFeedUrl(
        new URL(location, currentUrl).toString(),
      );
      continue;
    }

    if (!response.ok) {
      throw new Error(`Feed request failed with HTTP ${response.status}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && Number(contentLength) > maxBytes) {
      throw new Error(`Feed content exceeds ${maxBytes} bytes`);
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > maxBytes) {
      throw new Error(`Feed content exceeds ${maxBytes} bytes`);
    }

    const contentType = response.headers.get("content-type") ?? undefined;
    return {
      body: decodeResponseBody(arrayBuffer, contentType),
      finalUrl: currentUrl,
      ...(contentType ? { contentType } : {}),
    };
  }

  throw new Error("Feed redirect limit exceeded");
}

export async function parseFeedDocument(
  input: ParseFeedInput,
): Promise<Output> {
  const body = input.body.trim();
  if (!body) {
    throw new Error("Feed response is empty");
  }

  const result = looksLikeJsonFeed(body, input.contentType)
    ? parseJsonFeed(body, input)
    : await parseXmlFeed(body, input);

  return {
    feed: result.feed,
    items: result.items,
    markdown: buildMarkdown(result.feed, result.items, input.includeContent),
  };
}

export async function tool(
  props: z.infer<typeof InputType>,
): Promise<z.infer<typeof OutputType>> {
  const input = InputType.parse(props);
  const fetchedFeed = await fetchFeedText(input.feedUrl);
  const parseInput: ParseFeedInput = {
    body: fetchedFeed.body,
    feedUrl: input.feedUrl,
    finalUrl: fetchedFeed.finalUrl,
    maxItems: input.maxItems,
    includeContent: input.includeContent,
  };

  if (fetchedFeed.contentType) {
    parseInput.contentType = fetchedFeed.contentType;
  }

  const output = await parseFeedDocument(parseInput);

  return OutputType.parse(output);
}

function isRedirect(status: number): boolean {
  return status >= 300 && status < 400;
}

function decodeResponseBody(
  arrayBuffer: ArrayBuffer,
  contentType?: string,
): string {
  const charset = contentType?.match(/charset=([^;]+)/i)?.[1]?.trim();
  const decoder = createTextDecoder(charset);
  return decoder.decode(arrayBuffer).replace(/^\uFEFF/, "");
}

function createTextDecoder(charset?: string): TextDecoder {
  if (!charset) return new TextDecoder("utf-8");

  try {
    return new TextDecoder(charset);
  } catch {
    return new TextDecoder("utf-8");
  }
}

function isPrivateHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[/, "").replace(/\]$/, "");

  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host === "metadata.google.internal"
  ) {
    return true;
  }

  const ipVersion = isIP(host);
  if (ipVersion === 4) {
    return isPrivateIpv4(host);
  }
  if (ipVersion === 6) {
    return isPrivateIpv6(host);
  }

  return false;
}

function isPrivateIpv4(host: string): boolean {
  const parts = host.split(".").map((part) => Number(part));
  const [a, b] = parts;

  if (
    parts.length !== 4 ||
    parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255) ||
    a === undefined ||
    b === undefined
  ) {
    return true;
  }

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIpv6(host: string): boolean {
  const normalized = host.toLowerCase();
  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

function looksLikeJsonFeed(body: string, contentType?: string): boolean {
  return body.startsWith("{") || contentType?.includes("json") === true;
}

function parseJsonFeed(body: string, input: ParseFeedInput): Output {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw new Error("Failed to parse JSON Feed");
  }

  if (!isRecord(parsed) || !Array.isArray(parsed.items)) {
    throw new Error("Unsupported JSON Feed document");
  }

  const feed: FeedInfo = {
    title: cleanText(textValue(parsed.title)) || "Untitled Feed",
    format: "json-feed",
    feedUrl: input.finalUrl ?? validatePublicFeedUrl(input.feedUrl),
  };
  assignIfPresent(
    feed,
    "description",
    cleanText(textValue(parsed.description)),
  );
  assignIfPresent(
    feed,
    "siteUrl",
    absoluteUrl(textValue(parsed.home_page_url), feed.feedUrl),
  );
  assignIfPresent(feed, "language", cleanText(textValue(parsed.language)));
  assignIfPresent(
    feed,
    "updatedAt",
    cleanText(textValue(parsed.date_modified)),
  );

  const items = parsed.items
    .slice(0, input.maxItems)
    .map((item) => parseJsonFeedItem(item, feed.feedUrl, input.includeContent));

  return {
    feed,
    items,
    markdown: "",
  };
}

async function parseXmlFeed(
  body: string,
  input: ParseFeedInput,
): Promise<Output> {
  let parsed: unknown;
  try {
    parsed = await parseStringPromise(body, {
      explicitArray: false,
      explicitCharkey: true,
      trim: true,
    });
  } catch {
    throw new Error("Failed to parse feed XML");
  }

  if (!isRecord(parsed)) {
    throw new Error("Unsupported feed document");
  }

  const feedUrl = input.finalUrl ?? validatePublicFeedUrl(input.feedUrl);
  const rssRoot = findField(parsed, ["rss"]);
  if (isRecord(rssRoot)) {
    return parseRssFeed(rssRoot, feedUrl, input);
  }

  const atomRoot = findField(parsed, ["feed"]);
  if (isRecord(atomRoot)) {
    return parseAtomFeed(atomRoot, feedUrl, input);
  }

  const rdfRoot = findField(parsed, ["rdf:RDF", "RDF"]);
  if (isRecord(rdfRoot)) {
    return parseRdfFeed(rdfRoot, feedUrl, input);
  }

  throw new Error("Unsupported feed format");
}

function parseRssFeed(
  root: Dict,
  feedUrl: string,
  input: ParseFeedInput,
): Output {
  const channel = findField(root, ["channel"]);
  if (!isRecord(channel)) {
    throw new Error("RSS feed is missing channel");
  }

  const feed: FeedInfo = {
    title: cleanText(textFromField(channel, ["title"])) || "Untitled Feed",
    format: "rss",
    feedUrl,
  };
  assignIfPresent(
    feed,
    "description",
    cleanText(textFromField(channel, ["description"])),
  );
  assignIfPresent(
    feed,
    "siteUrl",
    absoluteUrl(textFromField(channel, ["link"]), feedUrl),
  );
  assignIfPresent(
    feed,
    "language",
    cleanText(textFromField(channel, ["language"])),
  );
  assignIfPresent(
    feed,
    "updatedAt",
    cleanText(
      textFromField(channel, [
        "lastBuildDate",
        "pubDate",
        "dc:date",
        "updated",
      ]),
    ),
  );

  const items = toArray(findField(channel, ["item"]))
    .slice(0, input.maxItems)
    .map((item) => parseRssItem(item, feedUrl, input.includeContent));

  return {
    feed,
    items,
    markdown: "",
  };
}

function parseAtomFeed(
  root: Dict,
  feedUrl: string,
  input: ParseFeedInput,
): Output {
  const feed: FeedInfo = {
    title: cleanText(textFromField(root, ["title"])) || "Untitled Feed",
    format: "atom",
    feedUrl,
  };
  assignIfPresent(
    feed,
    "description",
    cleanText(textFromField(root, ["subtitle", "summary"])),
  );
  assignIfPresent(
    feed,
    "siteUrl",
    pickAtomLink(findField(root, ["link"]), feedUrl),
  );
  assignIfPresent(
    feed,
    "language",
    cleanText(textFromField(root, ["language"])),
  );
  assignIfPresent(
    feed,
    "updatedAt",
    cleanText(textFromField(root, ["updated", "published"])),
  );

  const items = toArray(findField(root, ["entry"]))
    .slice(0, input.maxItems)
    .map((item) => parseAtomItem(item, feedUrl, input.includeContent));

  return {
    feed,
    items,
    markdown: "",
  };
}

function parseRdfFeed(
  root: Dict,
  feedUrl: string,
  input: ParseFeedInput,
): Output {
  const channel = findField(root, ["channel"]);
  const channelRecord = isRecord(channel) ? channel : {};
  const feed: FeedInfo = {
    title:
      cleanText(textFromField(channelRecord, ["title"])) || "Untitled Feed",
    format: "rdf",
    feedUrl,
  };
  assignIfPresent(
    feed,
    "description",
    cleanText(textFromField(channelRecord, ["description"])),
  );
  assignIfPresent(
    feed,
    "siteUrl",
    absoluteUrl(textFromField(channelRecord, ["link"]), feedUrl),
  );
  assignIfPresent(
    feed,
    "language",
    cleanText(textFromField(channelRecord, ["language"])),
  );
  assignIfPresent(
    feed,
    "updatedAt",
    cleanText(textFromField(channelRecord, ["dc:date"])),
  );

  const items = toArray(findField(root, ["item"]))
    .slice(0, input.maxItems)
    .map((item) => parseRssItem(item, feedUrl, input.includeContent));

  return {
    feed,
    items,
    markdown: "",
  };
}

function parseRssItem(
  value: unknown,
  feedUrl: string,
  includeContent: boolean,
): FeedItem {
  const item = asRecord(value);
  const parsedItem: FeedItem = {
    title: cleanText(textFromField(item, ["title"])) || "Untitled item",
  };

  assignIfPresent(
    parsedItem,
    "link",
    absoluteUrl(textFromField(item, ["link"]), feedUrl),
  );
  assignIfPresent(
    parsedItem,
    "author",
    cleanText(
      textFromField(item, ["dc:creator", "creator", "author", "itunes:author"]),
    ),
  );
  assignIfPresent(
    parsedItem,
    "publishedAt",
    cleanText(textFromField(item, ["pubDate", "published", "dc:date", "date"])),
  );
  assignIfPresent(
    parsedItem,
    "updatedAt",
    cleanText(textFromField(item, ["updated"])),
  );
  assignIfPresent(
    parsedItem,
    "summary",
    cleanText(
      textFromField(item, ["description", "summary", "itunes:summary"]),
    ),
  );
  assignIfPresent(
    parsedItem,
    "id",
    cleanText(textFromField(item, ["guid", "id"])),
  );

  const categories = collectCategories(findField(item, ["category"]));
  if (categories.length > 0) {
    parsedItem.categories = categories;
  }

  if (includeContent) {
    assignIfPresent(
      parsedItem,
      "content",
      cleanText(textFromField(item, ["content:encoded", "encoded", "content"])),
    );
  }

  return parsedItem;
}

function parseAtomItem(
  value: unknown,
  feedUrl: string,
  includeContent: boolean,
): FeedItem {
  const entry = asRecord(value);
  const parsedItem: FeedItem = {
    title: cleanText(textFromField(entry, ["title"])) || "Untitled item",
  };

  assignIfPresent(
    parsedItem,
    "link",
    pickAtomLink(findField(entry, ["link"]), feedUrl),
  );
  assignIfPresent(
    parsedItem,
    "author",
    parseAtomAuthor(findField(entry, ["author"])),
  );
  assignIfPresent(
    parsedItem,
    "publishedAt",
    cleanText(textFromField(entry, ["published"])),
  );
  assignIfPresent(
    parsedItem,
    "updatedAt",
    cleanText(textFromField(entry, ["updated"])),
  );
  assignIfPresent(
    parsedItem,
    "summary",
    cleanText(textFromField(entry, ["summary"])),
  );
  assignIfPresent(parsedItem, "id", cleanText(textFromField(entry, ["id"])));

  const categories = collectCategories(findField(entry, ["category"]));
  if (categories.length > 0) {
    parsedItem.categories = categories;
  }

  if (includeContent) {
    assignIfPresent(
      parsedItem,
      "content",
      cleanText(textFromField(entry, ["content"])),
    );
  }

  return parsedItem;
}

function parseJsonFeedItem(
  value: unknown,
  feedUrl: string,
  includeContent: boolean,
): FeedItem {
  const item = asRecord(value);
  const parsedItem: FeedItem = {
    title:
      cleanText(textValue(item.title)) ||
      cleanText(textValue(item.summary)) ||
      "Untitled item",
  };

  assignIfPresent(
    parsedItem,
    "link",
    absoluteUrl(textValue(item.url) ?? textValue(item.external_url), feedUrl),
  );
  assignIfPresent(parsedItem, "author", parseJsonAuthor(item));
  assignIfPresent(
    parsedItem,
    "publishedAt",
    cleanText(textValue(item.date_published)),
  );
  assignIfPresent(
    parsedItem,
    "updatedAt",
    cleanText(textValue(item.date_modified)),
  );
  assignIfPresent(
    parsedItem,
    "summary",
    cleanText(textValue(item.summary) ?? textValue(item.content_text)),
  );
  assignIfPresent(parsedItem, "id", cleanText(textValue(item.id)));

  const tags = toArray(item.tags)
    .map((tag) => cleanText(textValue(tag)))
    .filter(isNonEmptyString);
  if (tags.length > 0) {
    parsedItem.categories = tags;
  }

  if (includeContent) {
    assignIfPresent(
      parsedItem,
      "content",
      cleanText(textValue(item.content_text) ?? textValue(item.content_html)),
    );
  }

  return parsedItem;
}

function parseAtomAuthor(value: unknown): string | undefined {
  const authors = toArray(value)
    .map((author) => {
      const authorRecord = asRecord(author);
      return (
        cleanText(textFromField(authorRecord, ["name"])) ??
        cleanText(textValue(author))
      );
    })
    .filter(isNonEmptyString);

  return authors.length > 0 ? authors.join(", ") : undefined;
}

function parseJsonAuthor(item: Dict): string | undefined {
  const authors = toArray(item.authors)
    .map((author) =>
      cleanText(textValue(asRecord(author).name) ?? textValue(author)),
    )
    .filter(isNonEmptyString);

  if (authors.length > 0) {
    return authors.join(", ");
  }

  const author = item.author;
  if (isRecord(author)) {
    return cleanText(textValue(author.name));
  }

  return cleanText(textValue(author));
}

function collectCategories(value: unknown): string[] {
  return toArray(value)
    .map((category) => {
      const categoryRecord = asRecord(category);
      return (
        cleanText(textValue(category)) ??
        cleanText(attributeValue(categoryRecord, ["term", "label"]))
      );
    })
    .filter(isNonEmptyString);
}

function pickAtomLink(value: unknown, feedUrl: string): string | undefined {
  const links = toArray(value);
  const alternate =
    links.find((link) => {
      const attrs = asRecord(asRecord(link).$);
      return textValue(attrs.rel) === "alternate";
    }) ?? links[0];

  if (!alternate) {
    return undefined;
  }

  const linkRecord = asRecord(alternate);
  return absoluteUrl(
    attributeValue(linkRecord, ["href"]) ?? textValue(alternate),
    feedUrl,
  );
}

function buildMarkdown(
  feed: FeedInfo,
  items: FeedItem[],
  includeContent: boolean,
): string {
  const lines = [`# ${feed.title}`, ""];

  if (feed.description) {
    lines.push(feed.description, "");
  }
  lines.push(`Feed: ${feed.feedUrl}`);
  if (feed.siteUrl) lines.push(`Site: ${feed.siteUrl}`);
  if (feed.updatedAt) lines.push(`Updated: ${feed.updatedAt}`);
  lines.push("", "## Items");

  if (items.length === 0) {
    lines.push("", "No feed items found.");
    return lines.join("\n");
  }

  items.forEach((item, index) => {
    const title = item.link ? `[${item.title}](${item.link})` : item.title;
    lines.push("", `${index + 1}. ${title}`);
    if (item.publishedAt) lines.push(`   - Published: ${item.publishedAt}`);
    if (item.updatedAt) lines.push(`   - Updated: ${item.updatedAt}`);
    if (item.author) lines.push(`   - Author: ${item.author}`);
    if (item.categories?.length) {
      lines.push(`   - Categories: ${item.categories.join(", ")}`);
    }
    if (item.summary)
      lines.push(`   - Summary: ${truncate(item.summary, 600)}`);
    if (includeContent && item.content) {
      lines.push(`   - Content: ${truncate(item.content, 1200)}`);
    }
  });

  return lines.join("\n");
}

function findField(obj: Dict, candidates: string[]): unknown {
  for (const candidate of candidates) {
    if (Object.hasOwn(obj, candidate)) {
      return obj[candidate];
    }
  }

  for (const candidate of candidates) {
    const match = Object.entries(obj).find(
      ([key]) => key.split(":").pop() === candidate,
    );
    if (match) {
      return match[1];
    }
  }

  return undefined;
}

function textFromField(obj: Dict, candidates: string[]): string | undefined {
  return textValue(findField(obj, candidates));
}

function textValue(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (isRecord(value)) {
    return textValue(value._);
  }
  return undefined;
}

function attributeValue(obj: Dict, candidates: string[]): string | undefined {
  const attrs = asRecord(obj.$);
  for (const candidate of candidates) {
    const value = textValue(attrs[candidate]);
    if (value) return value;
  }
  return undefined;
}

function absoluteUrl(
  value: string | undefined,
  baseUrl: string,
): string | undefined {
  if (!value) return undefined;

  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return value;
  }
}

function cleanText(value: string | undefined): string | undefined {
  if (!value) return undefined;

  const text = decodeBasicEntities(stripHtml(value))
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0 ? text : undefined;
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ");
}

function decodeBasicEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1)}...`;
}

function assignIfPresent<T extends object, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined,
): void {
  if (value !== undefined) {
    target[key] = value;
  }
}

function toArray(value: unknown): unknown[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}

function isRecord(value: unknown): value is Dict {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): Dict {
  return isRecord(value) ? value : {};
}

function isNonEmptyString(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}
