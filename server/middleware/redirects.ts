// Slug-change redirects live in the CMS (GET /redirects). This middleware
// serves them for service URLs only, from a cached map, so the rest of the
// site never pays for the lookup. Order relative to redirect-default-locale
// does not matter: that one only touches /ru/**.
const SERVICES_PREFIXES = ["/services", "/uz/services", "/en/services"];

const isServicePath = (pathname: string) =>
  SERVICES_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

const loadRedirectMap = defineCachedFunction(
  async () => {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiUrl;

    if (!apiUrl || !config.apiUsername || !config.apiPassword) {
      return new Map<string, { to: string; code: number }>();
    }

    const credentials = Buffer.from(
      `${config.apiUsername}:${config.apiPassword}`,
    ).toString("base64");

    try {
      const rows = await $fetch<{ from: string; to: string; code?: number }[]>(
        `${apiUrl}redirects`,
        { headers: { Authorization: `Basic ${credentials}` } },
      );

      return new Map(
        (rows ?? []).map((row) => [
          row.from,
          { to: row.to, code: row.code ?? 301 },
        ]),
      );
    } catch (error) {
      // A missing map must never take the page down - serve it unredirected.
      console.error("Redirects: failed to load the redirect map", error);
      return new Map<string, { to: string; code: number }>();
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
  const hit = redirectMap.get(pathname);

  if (hit) {
    return sendRedirect(event, hit.to, hit.code);
  }
});
