import {
  buildRedirectMap,
  isRedirectPath,
  STATIC_REDIRECTS,
  type RedirectMap,
  type RedirectRow,
} from "../utils/redirects";

// Redirects live in the CMS (GET /redirects; slug changes, MCP create_redirect).
// This middleware serves them for every page path from a cached map; assets,
// chunks and API calls skip the lookup. Order relative to
// redirect-default-locale does not matter: that one only touches /ru/**.

// NOTE: defineCachedFunction JSON-serializes the cached value - a Map would
// come back as {} on cache hits. Keep the payload a plain record.
const loadRedirectMap = defineCachedFunction(
  async (): Promise<RedirectMap> => {
    const config = useRuntimeConfig();
    const apiUrl = config.public.apiUrl;

    if (!apiUrl || !config.apiUsername || !config.apiPassword) {
      return STATIC_REDIRECTS;
    }

    const credentials = Buffer.from(
      `${config.apiUsername}:${config.apiPassword}`,
    ).toString("base64");

    try {
      const rows = await $fetch<RedirectRow[]>(
        `${apiUrl}redirects`,
        { headers: { Authorization: `Basic ${credentials}` } },
      );

      return buildRedirectMap(rows);
    } catch (error) {
      // A missing CMS map must never take the page down.
      console.error("Redirects: failed to load the redirect map", error);
      return STATIC_REDIRECTS;
    }
  },
  { maxAge: 300, name: "redirect-map" },
);

export default defineEventHandler(async (event) => {
  const { pathname } = getRequestURL(event);

  if (!isRedirectPath(pathname)) {
    return;
  }

  const redirectMap = await loadRedirectMap();
  const hit = redirectMap[pathname];

  if (hit) {
    return sendRedirect(event, hit.to, hit.code);
  }
});
