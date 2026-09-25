// Targeted purge of the Nitro `swr` SSR cache, called by the admin backend
// (App\Services\FrontendCacheInvalidator) after a content write so the next
// request to the canonical URL renders fresh HTML. Guarded by a shared secret
// (NUXT_CACHE_INVALIDATE_TOKEN); paths are validated against an allowlist of
// record/list pages - there is no "purge everything" mode.
export default defineEventHandler(async (event) => {
  const expected = useRuntimeConfig().cacheInvalidateToken || "";
  const provided = getRequestHeader(event, "x-cache-invalidate-token") || "";

  if (!expected || !safeEqual(provided, expected)) {
    throw createError({ statusCode: 403, statusMessage: "Forbidden" });
  }

  const body = await readBody<{ paths?: unknown; redirects?: unknown }>(event);
  const requested = Array.isArray(body?.paths) ? body.paths : [];

  if (requested.length > MAX_PURGE_PATHS) {
    throw createError({ statusCode: 422, statusMessage: "Too many paths" });
  }

  const paths = requested.filter(isPurgeablePath);
  const rejected = requested.length - paths.length;

  const storage = useStorage("cache");
  const keys = paths.length
    ? selectRouteCacheKeys(await storage.getKeys("nitro:routes"), paths)
    : [];

  // Slug renames change the CMS redirect map cached by server/middleware/redirects.ts.
  if (body?.redirects === true) {
    keys.push(
      ...(await storage.getKeys("nitro:functions:services-redirect-map")),
    );
  }

  await Promise.all(keys.map((key) => storage.removeItem(key)));

  setResponseHeader(event, "Cache-Control", "no-store");
  return { removed: keys.length, paths, rejected };
});
