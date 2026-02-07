import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { parseStringPromise } from "xml2js";
import type { Input, Output } from "./schemas";

type ArxivEntry = {
  title?: string;
  author?: { name: string } | { name: string }[];
  summary?: string;
  link?:
    | { $: { href: string; type?: string; rel?: string; title?: string } }
    | { $: { href: string; type?: string; rel?: string; title?: string } }[];
  id?: string;
  published?: string;
  updated?: string;
  "arxiv:primary_category"?: { $: { term: string } };
  category?: { $: { term: string } } | { $: { term: string } }[];
  "arxiv:doi"?: { $: { href: string } };
  "arxiv:journal_ref"?: string;
  "arxiv:comment"?: string;
};

const getAuthors = (author: ArxivEntry["author"]): string[] => {
  if (!author) return [];
  return Array.isArray(author) ? author.map((a) => a.name) : [author.name];
};

const getCategories = (category: ArxivEntry["category"]): string[] => {
  if (!category) return [];
  return Array.isArray(category)
    ? category.map((c) => c.$.term)
    : [category.$.term];
};

const getPrimaryCategory = (
  primaryCategory: ArxivEntry["arxiv:primary_category"],
): string => {
  return primaryCategory?.$.term || "";
};

const extractArxivId = (id?: string): string => {
  if (!id) return "";
  const match = id.match(/(\d{4}\.\d{4,5}(v\d+)?|\w+-\w+\/\d{7}(v\d+)?)/);
  return match ? match[0] : "";
};

const extractVersion = (id?: string): string => {
  if (!id) return "";
  const match = id.match(/v(\d+)/);
  return match ? match[1] : "1";
};

const getLinks = (link: ArxivEntry["link"], id?: string) => {
  const links = {
    abstract: "",
    pdf: "",
    source: "",
  };

  const downloadUrls = {
    pdf: "",
    source: "",
    other: [] as string[],
  };

  if (!link) {
    if (id) {
      const arxivId = extractArxivId(id);
      links.abstract = `https://arxiv.org/abs/${arxivId}`;
      links.pdf = `https://arxiv.org/pdf/${arxivId}.pdf`;
      downloadUrls.pdf = `https://arxiv.org/pdf/${arxivId}.pdf`;
    }
    return { links, downloadUrls };
  }

  const linkArray = Array.isArray(link) ? link : [link];

  for (const l of linkArray) {
    const href = l.$.href;
    const type = l.$.type;
    const rel = l.$.rel;
    const title = l.$.title;

    if (type === "text/html" || href.includes("/abs/")) {
      links.abstract = href;
    } else if (type === "application/pdf" || href.includes(".pdf")) {
      links.pdf = href;
      downloadUrls.pdf = href;
    } else if (rel === "related" && title === "pdf") {
      links.pdf = href;
      downloadUrls.pdf = href;
    } else if (href.includes("/src/") || title === "Other formats") {
      links.source = href;
      downloadUrls.source = href;
    } else if (href.includes("arxiv.org")) {
      downloadUrls.other.push(href);
    }
  }

  if (!links.pdf && links.abstract) {
    const arxivId = extractArxivId(links.abstract);
    if (arxivId) {
      links.pdf = `https://arxiv.org/pdf/${arxivId}.pdf`;
      downloadUrls.pdf = `https://arxiv.org/pdf/${arxivId}.pdf`;
    }
  }

  return { links, downloadUrls };
};

const cleanText = (text?: string): string => {
  if (!text) return "";
  return text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\r/g, "")
    .trim();
};

const extractDoi = (doiInfo: ArxivEntry["arxiv:doi"]): string => {
  if (!doiInfo) return "";
  return doiInfo.$.href.replace(/^https?:\/\/dx\.doi\.org\//, "") || "";
};

export async function handler(
  { arxivId }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const cleanId = arxivId.replace(
    /^(arXiv:|http:\/\/arxiv\.org\/abs\/|https:\/\/arxiv\.org\/abs\/)/,
    "",
  );

  const url = `http://export.arxiv.org/api/query?id_list=${encodeURIComponent(cleanId)}`;

  const xml = await (await fetch(url)).text();
  const json = await parseStringPromise(xml, { explicitArray: false });

  const entries: ArxivEntry[] = json.feed.entry
    ? Array.isArray(json.feed.entry)
      ? json.feed.entry
      : [json.feed.entry]
    : [];

  if (entries.length === 0) {
    return { metadata: null };
  }

  const entry = entries[0];
  const { links, downloadUrls } = getLinks(entry.link, entry.id);

  const metadata = {
    arxivId: extractArxivId(entry.id),
    title: cleanText(entry.title),
    authors: getAuthors(entry.author),
    abstract: cleanText(entry.summary),
    categories: getCategories(entry.category),
    primaryCategory: getPrimaryCategory(entry["arxiv:primary_category"]),
    published: entry.published ?? "",
    updated: entry.updated ?? "",
    version: extractVersion(entry.id),
    doi: extractDoi(entry["arxiv:doi"]),
    journalRef: cleanText(entry["arxiv:journal_ref"]),
    comments: cleanText(entry["arxiv:comment"]),
    links,
    downloadUrls,
  };

  return { metadata };
}
