import { defineSitemapEventHandler } from "#imports";
import type { SitemapUrlInput } from "#sitemap/types";

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
      return [];
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

    return [
      ...blogEntries,
      ...portfolioEntries,
      ...serviceEntries,
    ];
  },
);
