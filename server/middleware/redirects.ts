// Slug-change redirects live in the CMS (GET /redirects). This middleware
// serves them for service URLs only, from a cached map, so the rest of the
// site never pays for the lookup. Order relative to redirect-default-locale
// does not matter: that one only touches /ru/**.
const SERVICES_PREFIXES = ["/services", "/uz/services", "/en/services"];

const isServicePath = (pathname: string) =>
  SERVICES_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

// NOTE: defineCachedFunction JSON-serializes the cached value - a Map would
// come back as {} on cache hits. Keep the payload a plain record.
type RedirectTarget = { to: string; code: number };
type RedirectMap = Record<string, RedirectTarget>;

const loadRedirectMap = defineCachedFunction(
  async (): Promise<RedirectMap> => {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiUrl;

    if (!apiUrl || !config.apiUsername || !config.apiPassword) {
      return {};
    }

    const credentials = Buffer.from(
      `${config.apiUsername}:${config.apiPassword}`,
    ).toString("base64");

    try {
      const rows = await $fetch<{ from: string; to: string; code?: number }[]>(
        `${apiUrl}redirects`,
        { headers: { Authorization: `Basic ${credentials}` } },
      );

      return Object.fromEntries(
        (rows ?? []).map((row) => [
          row.from,
          { to: row.to, code: row.code ?? 301 },
        ]),
      );
    } catch (error) {
      // A missing map must never take the page down - serve it unredirected.
      console.error("Redirects: failed to load the redirect map", error);
      return {};
    }
  },
  { maxAge: 300, name: "services-redirect-map" },
);

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);

  if (!isServicePath(pathname)) {
    return;
  }

  const redirectMap = await loadRedirectMap();
  const hit = redirectMap[pathname];

  if (hit) {
    return sendRedirect(event, hit.to, hit.code);
  }
});
