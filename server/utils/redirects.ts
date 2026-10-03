export type RedirectTarget = { to: string; code: number };
export type RedirectMap = Record<string, RedirectTarget>;
export type RedirectRow = { from: string; to: string; code?: number };

const REDIRECT_PREFIXES = [
  "/services",
  "/uz/services",
  "/en/services",
  "/portfolio",
  "/uz/portfolio",
  "/en/portfolio",
];

export const isRedirectPath = (pathname: string) =>
  REDIRECT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

// This project was deleted from the CMS, so its legacy URL is not represented
// in the dynamic redirect rows anymore.
export const STATIC_REDIRECTS: RedirectMap = {
  "/portfolio/v-united": { to: "/portfolio", code: 301 },
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
