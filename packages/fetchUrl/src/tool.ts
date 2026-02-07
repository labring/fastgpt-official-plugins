import type { ToolContextType } from "@fastgpt-plugin/helpers/tools/schemas/req";
import axios from "axios";
import * as cheerio from "cheerio";
// @ts-expect-error
import turndownPluginGfm from "joplin-turndown-plugin-gfm";
import TurndownService from "turndown";
import type { Input, Output } from "./schemas";

const MAX_CONTENT_LENGTH = 10 * 1024 * 1024; // 10MB
const MAX_TEXT_LENGTH = 100 * 1000; // 100k characters limit

const isInternalAddress = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;
    const fullUrl = parsedUrl.toString();

    // Metadata endpoints whitelist
    const metadataEndpoints = [
      // AWS
      "http://169.254.169.254/latest/meta-data/",
      // Azure
      "http://169.254.169.254/metadata/instance?api-version=2021-02-01",
      // GCP
      "http://metadata.google.internal/computeMetadata/v1/",
      // Alibaba Cloud
      "http://100.100.100.200/latest/meta-data/",
      // Tencent Cloud
      "http://metadata.tencentyun.com/latest/meta-data/",
      // Huawei Cloud
      "http://169.254.169.254/latest/meta-data/",
    ];
    if (metadataEndpoints.some((endpoint) => fullUrl.startsWith(endpoint))) {
      return true;
    }

    // For IP addresses, check if they are internal
    const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4Pattern.test(hostname)) {
      return false; // Not an IP address, so it's a domain name - consider it external by default
    }

    const parts = hostname.split(".").map(Number);

    if (parts.length !== 4 || parts.some((part) => part < 0 || part > 255)) {
      return false;
    }

    const p0 = parts[0]!;
    const p1 = parts[1]!;

    // Block internal/private IP ranges
    return (
      p0 === 0 ||
      p0 === 10 ||
      p0 === 127 ||
      (p0 === 169 && p1 === 254) ||
      (p0 === 172 && p1 >= 16 && p1 <= 31) ||
      (p0 === 192 && p1 === 168) ||
      (p0 >= 224 && p0 <= 239) ||
      (p0 >= 240 && p0 <= 255) ||
      (p0 === 100 && p1 >= 64 && p1 <= 127) ||
      (p0 === 9 && p1 === 0) ||
      (p0 === 11 && p1 === 0)
    );
  } catch {
    return false; // If URL parsing fails, reject it as potentially unsafe
  }
};

const cheerioToHtml = ({
  fetchUrl,
  $,
  selector,
}: {
  fetchUrl: string;
  $: cheerio.CheerioAPI;
  selector?: string;
}): { html: string; title: string } => {
  const originUrl = new URL(fetchUrl).origin;
  const protocol = new URL(fetchUrl).protocol; // http: or https:

  const usedSelector = selector || "body";
  const selectDom = $(usedSelector);

  // remove i element
  selectDom.find("i,script,style").remove();

  // remove empty a element
  selectDom
    .find("a")
    .filter((_i, el) => {
      return $(el).text().trim() === "" && $(el).children().length === 0;
    })
    .remove();

  // if link,img startWith /, add origin url
  selectDom.find("a").each((_i, el) => {
    const href = $(el).attr("href");
    if (href) {
      if (href.startsWith("//")) {
        $(el).attr("href", protocol + href);
      } else if (href.startsWith("/")) {
        $(el).attr("href", originUrl + href);
      }
    }
  });
  selectDom.find("img, video, source, audio, iframe").each((_i, el) => {
    const src = $(el).attr("src");
    if (src) {
      if (src.startsWith("//")) {
        $(el).attr("src", protocol + src);
      } else if (src.startsWith("/")) {
        $(el).attr("src", originUrl + src);
      }
    }
  });

  const html = selectDom
    .map((_item, dom) => {
      return $(dom).html();
    })
    .get()
    .join("\n");

  const title = $("head title").text() || $("h1:first").text() || fetchUrl;

  return { html, title };
};

const html2md = (html: string): string => {
  if (html.length > MAX_TEXT_LENGTH) {
    html = html.slice(0, MAX_TEXT_LENGTH);
  }
  const turndownService = new TurndownService({
    headingStyle: "atx",
    bulletListMarker: "-",
    codeBlockStyle: "fenced",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
  });

  turndownService.remove(["i", "script", "iframe", "style"]);

  turndownService.use(turndownPluginGfm.gfm);

  const md = turndownService.turndown(html);

  const formatMd = md.replace(
    /(!\[([^\]]*)\]|\[([^\]]*)\])(\([^)]*\))/g,
    (
      _match: string,
      _prefix: string,
      imageAlt: string,
      linkAlt: string,
      url: string,
    ) => {
      const altText = imageAlt !== undefined ? imageAlt : linkAlt;
      const cleanAltText = altText.replace(/\n+/g, " ").trim();

      return imageAlt !== undefined
        ? `![${cleanAltText}]${url}`
        : `[${cleanAltText}]${url}`;
    },
  );

  return formatMd;
};

const urlsFetch = async ({
  url,
  selector,
}: {
  url: string;
  selector?: string;
}): Promise<{ title: string; content: string }> => {
  if (isInternalAddress(url)) {
    return {
      title: "",
      content: "Cannot fetch internal url",
    };
  }

  const fetchRes = await axios.get(url, {
    timeout: 30000,
    maxContentLength: MAX_CONTENT_LENGTH,
    maxBodyLength: MAX_CONTENT_LENGTH,
    responseType: "text",
  });

  if (fetchRes.data && fetchRes.data.length > MAX_CONTENT_LENGTH) {
    return Promise.reject(`Content size exceeds ${MAX_CONTENT_LENGTH} limit`);
  }

  const $ = cheerio.load(fetchRes.data);
  const { title, html } = cheerioToHtml({
    fetchUrl: url,
    $,
    ...(selector != null ? { selector } : {}),
  });

  return {
    title,
    content: html2md(html),
  };
};

export async function handler(
  input: Input,
  _ctx: ToolContextType,
): Promise<Output> {
  const { title, content } = await urlsFetch({
    url: input.url,
    selector: "body",
  });

  return {
    title,
    result: content,
  };
}
