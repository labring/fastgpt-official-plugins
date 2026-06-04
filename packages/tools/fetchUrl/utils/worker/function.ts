import { cheerioToHtml } from './streamToMarkdown';
import { html2md } from './htmlToMarkdown/utils';

export async function streamToMarkdown({
  response,
  url,
  selector
}: {
  response: string;
  url: string;
  selector?: string;
}) {
  const cheerio = await import('cheerio');
  const $ = cheerio.load(response);
  const { title, html } = cheerioToHtml({ fetchUrl: url, $, selector });
  return { title, content: html2md(html) };
}
