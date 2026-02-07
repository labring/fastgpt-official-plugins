import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import { parseStringPromise } from "xml2js";
import type { Input, Output } from "./schemas";

type ArxivEntry = {
  title?: string;
  author?: { name: string } | { name: string }[];
  summary?: string;
  link?:
    | { $: { href: string; type?: string } }
    | { $: { href: string; type?: string } }[];
  id?: string;
  published?: string;
};

const getSortBy = (sortBy: string) => sortBy;

const getAuthors = (author: ArxivEntry["author"]): string[] => {
  if (!author) return [];
  return Array.isArray(author) ? author.map((a) => a.name) : [author.name];
};

const getLink = (link: ArxivEntry["link"], id?: string): string => {
  if (!link) return id || "";
  if (Array.isArray(link)) {
    const html = link.find((l) => l.$.type === "text/html");
    return html ? html.$.href : id || "";
  }
  return link.$.href || id || "";
};

export async function handler(
  { author, maxResults, sortBy }: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const url = `http://export.arxiv.org/api/query?search_query=au:${encodeURIComponent(author)}&max_results=${maxResults}&sortBy=${getSortBy(sortBy)}`;
  const xml = await (await fetch(url)).text();
  const json = await parseStringPromise(xml, { explicitArray: false });
  const entries: ArxivEntry[] = json.feed.entry
    ? Array.isArray(json.feed.entry)
      ? json.feed.entry
      : [json.feed.entry]
    : [];

  const papers = entries.map((e) => ({
    title: e.title?.trim() ?? "",
    authors: getAuthors(e.author),
    summary: e.summary?.trim() ?? "",
    link: getLink(e.link, e.id),
    published: e.published ?? "",
  }));

  return { papers };
}
