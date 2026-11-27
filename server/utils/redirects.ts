export type RedirectTarget = { to: string; code: number };
export type RedirectMap = Record<string, RedirectTarget>;
export type RedirectRow = { from: string; to: string; code?: number };

// Framework and asset paths never carry CMS redirects; skipping them keeps the
// lookup off the hot path for chunks, images and API calls.
const INTERNAL_PREFIXES = ["/_nuxt", "/_ipx", "/api", "/__"];

/** Page-like paths that may have a CMS redirect (any section, not "/"). */
export const isRedirectPath = (pathname: string) =>
  pathname !== "/" &&
  !INTERNAL_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  ) &&
  !/\.[a-z0-9]+$/i.test(pathname);

// This project was deleted from the CMS, so its legacy URL is not represented
// in the dynamic redirect rows anymore.
export const STATIC_REDIRECTS: RedirectMap = {
  "/portfolio/v-united": { to: "/portfolio", code: 301 },
  "/uz/portfolio/v-united": { to: "/uz/portfolio", code: 301 },
  "/en/portfolio/v-united": { to: "/en/portfolio", code: 301 },
};

export const buildRedirectMap = (
  rows: RedirectRow[] | null | undefined,
): RedirectMap => ({
  ...STATIC_REDIRECTS,
  ...Object.fromEntries(
    (rows ?? []).map((row) => [
      row.from,
      { to: row.to, code: row.code ?? 301 },
    ]),
  ),
});
