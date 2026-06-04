export function cheerioToHtml({
  $,
  selector
}: {
  fetchUrl: string;
  $: any;
  selector?: string;
}) {
  const title = $('title').first().text() || '';
  const html = selector ? $(selector).html() || $.html(selector) : $('body').html() || $.html();
  return { title, html };
}
