// Free tools shown on the /tools hub and in the footer. Tool pages have
// per-locale slugs (defineI18nRoute), so link by route name, not by path.
// `updatedAt` is the visible "updated" date and JSON-LD dateModified - bump it
// together with STATIC_PAGE_LASTMOD when the tool page copy changes.
export const TOOLS = [
  {
    id: "alphabet",
    route: "tools-alphabet-converter",
    updatedAt: "2026-10-26",
  },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

export const findTool = (id: ToolId) => TOOLS.find((tool) => tool.id === id)!;
