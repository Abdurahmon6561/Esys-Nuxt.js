import { defineSitemapEventHandler } from "#imports";
import type { SitemapUrlInput } from "#sitemap/types";
import { staticPageEntries } from "../../utils/static-page-lastmod";

// services/sitemap rows: one per published locale+alias pair, with the
// service's other published translations pre-grouped by the backend.
type ServiceSitemapRow = {
  locale: string;
  alias: string;
  updated_at?: string;
  alternates?: Record<string, string>;
};

const localizedLoc = (section: string) => (locale: string, alias: string) =>
  locale === "ru" ? `/${section}/${alias}` : `/${locale}/${section}/${alias}`;
const serviceLoc = localizedLoc("services");
const portfolioLoc = localizedLoc("portfolio");
const blogLoc = localizedLoc("blog");

// Feeds dynamic blog/portfolio URLs into @nuxtjs/sitemap.
// Uses server-only Basic Auth credentials - never exposed to the client.
export default defineSitemapEventHandler(
  async (): Promise<SitemapUrlInput[]> => {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiUrl;

    if (!apiUrl || !config.apiUsername || !config.apiPassword) {
      console.error("Sitemap: API url or credentials are not configured");
      return staticPageEntries();
    }

    const credentials = Buffer.from(
      `${config.apiUsername}:${config.apiPassword}`,
    ).toString("base64");

    // services/sitemap and portfolio/sitemap rows: one per published,
    // indexable, self-canonical locale+alias pair with published alternates.
    // They deliberately skip _i18nTransform: it would expand each URL into
    // every locale, including untranslated ones.
    const fetchLocalizedEntries = async (
      endpoint: string,
      toLoc: (locale: string, alias: string) => string,
    ): Promise<SitemapUrlInput[]> => {
      try {
        const rows = await $fetch<ServiceSitemapRow[]>(`${apiUrl}${endpoint}`, {
          headers: { Authorization: `Basic ${credentials}` },
        });
        return (rows ?? []).map((row) => ({
          loc: toLoc(row.locale, row.alias),
          lastmod: row.updated_at,
          alternatives: Object.entries(row.alternates ?? {}).map(
            ([loc, alias]) => ({ hreflang: loc, href: toLoc(loc, alias) }),
          ),
        }));
      } catch (error) {
        console.error(`Sitemap: failed to fetch ${endpoint}`, error);
        return [];
      }
    };

    const [blogEntries, portfolioEntries, serviceEntries] = await Promise.all([
      fetchLocalizedEntries("blog/sitemap", blogLoc),
      fetchLocalizedEntries("portfolio/sitemap", portfolioLoc),
      fetchLocalizedEntries("services/sitemap", serviceLoc),
    ]);

    // Listing pages come from app sources without a lastmod; the module's
    // `defaults` is not applied to the i18n multi-sitemaps. Emit a bare
    // entry per listing whose lastmod is its newest item - it merges with the
    // app-source entry on the same loc. Home gets the newest item overall.
    const newestByLoc = new Map<string, string>();
    const bump = (loc: string, lastmod?: string) => {
      if (!lastmod) return;
      const current = newestByLoc.get(loc);
      if (!current || Date.parse(lastmod) > Date.parse(current)) {
        newestByLoc.set(loc, lastmod);
      }
    };
    const listingLoc = (locale: string, section: string) =>
      locale === "ru" ? `/${section}` : `/${locale}/${section}`;
    const homeLoc = (locale: string) => (locale === "ru" ? "/" : `/${locale}`);
    const sections: [string, SitemapUrlInput[]][] = [
      ["blog", blogEntries],
      ["portfolio", portfolioEntries],
      ["services", serviceEntries],
    ];
    for (const [section, entries] of sections) {
      for (const entry of entries) {
        const loc = String(entry.loc);
        const locale = /^\/(en|uz)\//.exec(loc)?.[1] ?? "ru";
        const lastmod = entry.lastmod ? String(entry.lastmod) : undefined;
        bump(listingLoc(locale, section), lastmod);
        bump(homeLoc(locale), lastmod);
      }
    }
    const listingEntries: SitemapUrlInput[] = [...newestByLoc].map(
      ([loc, lastmod]) => ({ loc, lastmod }),
    );

    return [
      ...blogEntries,
      ...portfolioEntries,
      ...serviceEntries,
      ...listingEntries,
      ...staticPageEntries(),
    ];
  },
);
