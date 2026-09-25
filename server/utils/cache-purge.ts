// Pure helpers for /api/__cache/invalidate - unit-tested in
// tests/cache-purge.test.ts, no Nitro imports.

export const MAX_PURGE_PATHS = 50;

// Only record pages and list pages the CMS can change. Anything else (/, /api,
// assets, arbitrary strings) is rejected, so the endpoint cannot be used as a
// generic cache flush.
const PURGEABLE =
  /^\/(?:(?:en|uz)\/)?(?:services|portfolio|blog)(?:\/[a-z0-9][a-z0-9-]{0,190})?$/;

export const isPurgeablePath = (path: unknown): path is string =>
  typeof path === "string" && PURGEABLE.test(path);

// Mirrors nitropack's defineCachedEventHandler key: the first 16 characters of
// the pathname with non-word characters removed, then "." + a hash of the full
// URL (query included). Matching on the prefix drops every query variant of
// the page; a prefix shared with a sibling page only over-purges, never misses.
export const routeCacheKeyPrefix = (path: string): string =>
  `:${decodeURI(path).replace(/\W/g, "").slice(0, 16) || "index"}.`;

export function selectRouteCacheKeys(
  keys: string[],
  paths: string[],
): string[] {
  const prefixes = paths.map(routeCacheKeyPrefix);

  return keys.filter(
    (key) =>
      key.startsWith("nitro:routes:") &&
      prefixes.some((prefix) => key.includes(prefix)),
  );
}

// Constant-time compare for the shared secret.
export function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
