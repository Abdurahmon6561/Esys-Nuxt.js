import { test } from "node:test";
import assert from "node:assert/strict";
import { sitemapAlternatives } from "../server/utils/sitemap-alternates.ts";

const blogLoc = (locale: string, alias: string) =>
  locale === "ru" ? `/blog/${alias}` : `/${locale}/blog/${alias}`;

test("adds x-default pointing at the ru URL, matching the page head", () => {
  const alts = sitemapAlternatives({ ru: "post", uz: "post", en: "post" }, blogLoc);
  assert.deepEqual(alts, [
    { hreflang: "x-default", href: "/blog/post" },
    { hreflang: "ru", href: "/blog/post" },
    { hreflang: "uz", href: "/uz/blog/post" },
    { hreflang: "en", href: "/en/blog/post" },
  ]);
});

test("omits x-default when there is no ru translation", () => {
  const alts = sitemapAlternatives({ en: "post", uz: "post" }, blogLoc);
  assert.ok(!alts.some((a) => a.hreflang === "x-default"));
  assert.equal(alts.length, 2);
});

test("handles missing alternates", () => {
  assert.deepEqual(sitemapAlternatives(undefined, blogLoc), []);
});
