export type LegacyPage = { slug: string; title: string; description: string; mainHtml: string };

const decodeHtml = (v: string) => v.replaceAll("&amp;", "&").replaceAll("&quot;", '"').replaceAll("&#39;", "'").replaceAll("&lt;", "<").replaceAll("&gt;", ">");
const extract = (pattern: RegExp, html: string) => html.match(pattern)?.[1]?.trim() ?? "";

export function parseLegacyHtml(slug: string, html: string): LegacyPage {
  return {
    slug,
    title: decodeHtml(extract(/<title>([\s\S]*?)<\/title>/i, html)),
    description: decodeHtml(extract(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i, html)),
    mainHtml: extract(/<main>([\s\S]*?)<\/main>/i, html),
  };
}
