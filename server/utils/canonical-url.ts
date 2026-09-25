// Pure URL normalization for public HTML pages - no Nitro imports, so it can
// be unit-tested with `node --test` (see tests/canonical-url.test.ts).

export type CanonicalUrlInput = {
  method: string;
  host: string;
  pathname: string;
  search: string;
};

export type CanonicalUrlOptions = {
  // e.g. "https://esys.pro" - the only origin a redirect may point to.
  siteOrigin: string;
};

// Framework/asset namespaces and anything file-like are never touched: API
// (incl. the /api/backend proxy and webhooks), /_nuxt, /_ipx, /__sitemap__,
// /_i18n ... all start with "/_" or "/api".
const isExcludedPath = (pathname: string) =>
  pathname === "/api" ||
  pathname.startsWith("/api/") ||
  pathname.startsWith("/_") ||
  /\.[a-z0-9]+\/?$/i.test(pathname);

/**
 * Returns the absolute Location for a single 301 that fixes, at once:
 *  - the www host (www.esys.pro → esys.pro),
 *  - a trailing slash on any path except the root,
 *  - an explicit default-locale prefix (/ru, /ru/... → unprefixed),
 *  - duplicate slashes.
 * Path and query string are preserved. Returns null when no redirect is
 * needed. The target origin is always `siteOrigin` or, for non-www hosts,
 * a same-origin relative path starting with exactly one "/", so the result
 * can never be an open redirect.
 */
export function canonicalRedirect(
  input: CanonicalUrlInput,
  options: CanonicalUrlOptions,
): string | null {
  if (input.method !== "GET" && input.method !== "HEAD") return null;
  if (isExcludedPath(input.pathname)) return null;

  const siteHost = new URL(options.siteOrigin).host.toLowerCase();
  const host = input.host.toLowerCase();
  const isWww = host === `www.${siteHost}`;

  let path = input.pathname.replace(/\/{2,}/g, "/");

  if (path === "/ru" || path.startsWith("/ru/")) {
    path = path.slice(3) || "/";
  }

  if (path.length > 1 && path.endsWith("/")) {
    path = path.replace(/\/+$/, "") || "/";
  }

  if (!isWww && path === input.pathname) return null;

  const target = `${path}${input.search}`;

  return isWww ? `${options.siteOrigin.replace(/\/$/, "")}${target}` : target;
}
