import { defineSitemapEventHandler } from "#imports";
import type { SitemapUrlInput } from "#sitemap/types";

type ListResponse = { data?: { alias?: string }[] };

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

    const [blogAliases, portfolioAliases] = await Promise.all([
      fetchAliases("blog/all"),
      fetchAliases("portfolio/all"),
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
    ];
  },
);
