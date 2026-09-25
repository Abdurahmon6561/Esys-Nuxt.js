// One 301 to the canonical public URL: https://esys.pro, no trailing slash
// (except "/"), no explicit /ru prefix. Replaces redirect-default-locale.ts so
// www + /ru + trailing slash resolve in a single hop instead of a chain.
// The Host header is only compared against the configured site host - the
// redirect target is built from runtime config, never from request headers.
export default defineEventHandler((event) => {
  const siteOrigin = useRuntimeConfig().public.siteUrl || "https://esys.pro";
  const url = getRequestURL(event);

  const location = canonicalRedirect(
    {
      method: event.method,
      host: getRequestHost(event),
      pathname: url.pathname,
      search: url.search,
    },
    { siteOrigin },
  );

  if (location) {
    return sendRedirect(event, location, 301);
  }
});
