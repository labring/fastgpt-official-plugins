export function htmlTable2Md(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(table|tbody)>/gi, '')
    .replace(/<tr[^>]*>/gi, '')
    .replace(/<\/tr>/gi, '\n')
    .replace(/<t[dh][^>]*>/gi, '| ')
    .replace(/<\/t[dh]>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}
