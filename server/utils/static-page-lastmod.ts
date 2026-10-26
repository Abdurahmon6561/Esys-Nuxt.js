// Hand-curated lastmod dates for static (app-source) pages. Bumped by hand
// when the page copy changes - NOT build time / new Date(), which would
// change on every deploy and teach Google to ignore the signal.

// loc -> ISO date. ru is the default, unprefixed locale (i18n
// prefix_except_default), so it has no /ru prefix.
export const STATIC_PAGE_LASTMOD: Record<string, string> = {
  "/about": "2026-10-26",
  "/en/about": "2026-10-26",
  "/uz/about": "2026-10-26",
  "/contact": "2026-10-26",
  "/en/contact": "2026-10-26",
  "/uz/contact": "2026-10-26",
  "/tools": "2026-10-26",
  "/en/tools": "2026-10-26",
  "/uz/tools": "2026-10-26",
  "/tools/konverter-novyy-uzbekskiy-alfavit": "2026-10-26",
  "/en/tools/new-uzbek-alphabet-converter": "2026-10-26",
  "/uz/tools/yangi-alifbo-konvertor": "2026-10-26",
};

export const staticPageEntries = (): { loc: string; lastmod: string }[] =>
  Object.entries(STATIC_PAGE_LASTMOD).map(([loc, lastmod]) => ({
    loc,
    lastmod,
  }));
