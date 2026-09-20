import { defineSitemapEventHandler } from "#imports";
import type { SitemapUrlInput } from "#sitemap/types";

type ListResponse = { data?: { alias?: string }[] };

// services/sitemap rows: one per published locale+alias pair, with the
// service's other published translations pre-grouped by the backend.
type ServiceSitemapRow = {
  locale: string;
  alias: string;
  updated_at?: string;
  alternates?: Record<string, string>;
};

const serviceLoc = (locale: string, alias: string) =>
  locale === "ru" ? `/services/${alias}` : `/${locale}/services/${alias}`;

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

    const fetchAliases = async (endpoint: string): Promise<string[]> => {
      try {
        const response = await $fetch<ListResponse>(`${apiUrl}${endpoint}`, {
          headers: { Authorization: `Basic ${credentials}` },
        });
        return (response?.data ?? [])
          .map((item) => item.alias)
          .filter((alias): alias is string => Boolean(alias));
      } catch (error) {
        console.error(`Sitemap: failed to fetch ${endpoint}`, error);
        return [];
      }
    };

    const fetchServiceEntries = async (): Promise<SitemapUrlInput[]> => {
      try {
        const rows = await $fetch<ServiceSitemapRow[]>(
          `${apiUrl}services/sitemap`,
          { headers: { Authorization: `Basic ${credentials}` } },
        );
        // Services deliberately skip _i18nTransform: it would expand each
        // URL into every locale, including unpublished ones. The backend
        // already emits one row per published pair, with alternates built
        // only from published translations.
        return (rows ?? []).map((row) => ({
          loc: serviceLoc(row.locale, row.alias),
          lastmod: row.updated_at,
          alternatives: {
            languages: Object.fromEntries(
              Object.entries(row.alternates ?? {}).map(([loc, alias]) => [
                loc,
                serviceLoc(loc, alias),
              ]),
            ),
          },
        }));
      } catch (error) {
        console.error("Sitemap: failed to fetch services/sitemap", error);
        return [];
      }
    };

    const [blogAliases, portfolioAliases, serviceEntries] = await Promise.all([
      fetchAliases("blog/all"),
      fetchAliases("portfolio/all"),
      fetchServiceEntries(),
    ]);

    return [
      ...blogAliases.map((alias) => ({
        loc: `/blog/${alias}`,
        _i18nTransform: true,
      })),
      ...portfolioAliases.map((alias) => ({
        loc: `/portfolio/${alias}`,
        _i18nTransform: true,
      })),
      ...serviceEntries,
    ];
  },
);
