export type SitemapAlternative = { hreflang: string; href: string };

/**
 * hreflang alternatives for one sitemap URL, mirroring the page head built by
 * usePageAlternates: one link per published locale, plus x-default pointing at
 * the ru URL (ru is the unprefixed default locale). Without x-default here the
 * sitemap and the HTML disagree, which audits flag as a hreflang mismatch.
 */
export function sitemapAlternatives(
  alternates: Record<string, string> | undefined,
  toLoc: (locale: string, alias: string) => string,
): SitemapAlternative[] {
  const entries = Object.entries(alternates ?? {}).map(([locale, alias]) => ({
    hreflang: locale,
    href: toLoc(locale, alias),
  }));
  const ru = alternates?.ru;
  return ru ? [{ hreflang: "x-default", href: toLoc("ru", ru) }, ...entries] : entries;
}
